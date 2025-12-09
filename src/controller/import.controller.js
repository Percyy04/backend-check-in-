import firestoreService from '../services/firestore.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { BadRequestError, NotFoundError } from '../utils/errors.js';
import logger from '../utils/logger.js';
import { parse } from 'csv-parse/sync';
import { Readable } from 'stream';

/**
 * Import Controller
 * Import users từ CSV/JSON của AI team
 */
class ImportController {
  /**
   * POST /api/import/csv
   * Import users từ CSV file
   * CSV format: Name, House, ID_Name, ID_Image, Seat  (optional for VIP)
   */
  async importFromCSV(req, res, next) {
    try {
      if (!req.file) {
        throw new BadRequestError('CSV file is required', 'MISSING_FILE');
      }

      // Remove BOM character if present
      let csvBuffer = req.file.buffer.toString('utf-8');
      if (csvBuffer.charCodeAt(0) === 0xFEFF) {
        csvBuffer = csvBuffer.slice(1);
      }

      // Parse CSV
      const records = parse(csvBuffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_column_count: true, // Allow rows with different column counts
      });

      if (records.length === 0) {
        throw new BadRequestError('CSV file is empty or invalid', 'EMPTY_CSV');
      }

      logger.info(`Importing ${records.length} users from CSV`);

      const results = {
        total: records.length,
        created: 0,
        updated: 0,
        skipped: 0,
        errors: [],
      };

      // Process each record
      for (let i = 0; i < records.length; i++) {
        const row = records[i];
        const lineNumber = i + 2; // +2 vì có header và index bắt đầu từ 0

        try {
          // Skip completely empty rows (no values in any column)
          const hasAnyValue = Object.values(row).some(val => val && val.trim() !== '');
          if (!hasAnyValue) {
            // Silently skip empty rows
            continue;
          }

          // Validate required fields
          if (!row.Name || !row.ID_Name) {
            results.errors.push({
              line: lineNumber,
              error: 'Missing required fields: Name or ID_Name',
              data: row,
            });
            results.skipped++;
            continue;
          }

          // ============================================
          // CSV Mapping Logic:
          // - Name → name (DB field)
          // - House → xác định isVIP (A = VIP, các nhà khác = GUEST)
          // - ID_Name → userId trực tiếp (F00, P00, T00, U00) - KHÔNG convert
          // - ID_Image → imageUrl (DB field)
          // ============================================

          // ID_Name sẽ là userId trực tiếp (F00, P00, T00, U00)
          let userId = row.ID_Name.trim().toUpperCase();
          const house = (row.House || '').trim();
          let isVIP = false;

          // Xác định isVIP từ House (KHÔNG phải từ cột VIP/GUEST trong CSV)
          if (house.toUpperCase() === 'FPT' || house.includes('FPT')) {
            // House = FPTU → VIP (F00, F01, F02... của FPTU là VIP)
            isVIP = true;
          } else if (house.includes('Faerie') || house.includes('Phoenix') ||
            house.includes('Thunderbird') || house.includes('Unicorn')) {
            // House = Faerie/Phoenix/Thunderbird/Unicorn → GUEST
            isVIP = false;
          } else {
            // Default to GUEST
            isVIP = false;
          }

          // Build user data từ CSV columns
          const userData = {
            userId,
            name: row.Name.trim(),        // Name → name
            isVIP,                        // Xác định từ House (FPTU = true, còn lại = false)
            imageUrl: row.ID_Image?.trim() || null,  // ID_Image → imageUrl
            checkedIn: false,
            checkedInAt: null,
            checkedInMethod: null,
          };

          // Add seat for VIP only
          if (isVIP && row.Seat) {
            userData.seat = row.Seat.trim();
          } else if (isVIP && !row.Seat) {
            // Generate seat for VIP if not provided
            const seatNum = userId.match(/\d+/)?.[0] || String(i + 1);
            userData.seat = `A${seatNum.padStart(2, '0')}`;
          }

          // Check if user exists
          try {
            const existingUser = await firestoreService.getUser(userId);

            // Update existing user
            await firestoreService.updateUser(userId, {
              name: userData.name,
              isVIP: userData.isVIP,
              imageUrl: userData.imageUrl,
              ...(userData.seat && { seat: userData.seat }),
            });
            results.updated++;
            logger.debug(`Updated user: ${userId}`);
          } catch (error) {
            // Check if error is NotFoundError (user doesn't exist)
            if (error instanceof NotFoundError || error.errorCode === 'USER_NOT_FOUND' || error.name === 'NotFoundError' || error.message?.includes('not found')) {
              // Create new user
              await firestoreService.createUser(userData);
              results.created++;
              logger.debug(`Created user: ${userId}`);
            } else {
              throw error;
            }
          }
        } catch (error) {
          results.errors.push({
            line: lineNumber,
            error: error.message,
            data: row,
          });
          results.skipped++;
          logger.error(`Error processing line ${lineNumber}`, { error: error.message, row });
        }
      }

      logger.info('CSV import completed', results);

      return ApiResponse.success(res, results, `Import completed: ${results.created} created, ${results.updated} updated, ${results.skipped} skipped`);

    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/import/json
   * Import users từ JSON (AI team format: Name, ID_Name)
   */
  async importFromJSON(req, res, next) {
    try {
      const { users } = req.body;

      if (!Array.isArray(users) || users.length === 0) {
        throw new BadRequestError('Users array is required and must not be empty', 'INVALID_JSON');
      }

      logger.info(`Importing ${users.length} users from JSON`);

      const results = {
        total: users.length,
        created: 0,
        updated: 0,
        skipped: 0,
        errors: [],
      };

      // Process each user
      for (let i = 0; i < users.length; i++) {
        const user = users[i];

        try {
          // Validate required fields
          if (!user.Name || !user.ID_Name) {
            results.errors.push({
              index: i,
              error: 'Missing required fields: Name or ID_Name',
              data: user,
            });
            results.skipped++;
            continue;
          }

          // ID_Name sẽ là userId trực tiếp (F00, P00, T00, U00)
          let userId = user.ID_Name.trim().toUpperCase();

          // JSON từ AI team chỉ có Name và ID_Name, không có House
          // Cần xác định isVIP:
          // 1. Nếu user đã tồn tại trong DB → lấy isVIP từ DB
          // 2. Nếu chưa tồn tại → cần House trong JSON hoặc lookup từ DB
          let isVIP = false;

          // Thử tìm user trong DB trước để lấy isVIP
          try {
            const existingUser = await firestoreService.getUser(userId);
            isVIP = existingUser.isVIP || false;
          } catch (error) {
            // User chưa tồn tại, xác định từ House nếu có
            if (user.House && (user.House.toUpperCase() === 'FPTU' || user.House.includes('FPTU'))) {
              isVIP = true;
            }
            // Nếu không có House và user chưa tồn tại, mặc định là GUEST
          }

          // Build user data
          const userData = {
            userId,
            name: user.Name.trim(),
            isVIP,
            checkedIn: false,
            checkedInAt: null,
            checkedInMethod: null,
          };

          // Add seat for VIP only
          if (isVIP) {
            const seatNum = userId.match(/\d+/)?.[0] || String(i + 1);
            userData.seat = `A${seatNum.padStart(2, '0')}`;
          }

          // Check if user exists
          try {
            const existingUser = await firestoreService.getUser(userId);

            // Update existing user
            await firestoreService.updateUser(userId, {
              name: userData.name,
              isVIP: userData.isVIP,
              ...(userData.seat && { seat: userData.seat }),
            });
            results.updated++;
            logger.debug(`Updated user: ${userId}`);
          } catch (error) {
            // Check if error is NotFoundError (user doesn't exist)
            if (error instanceof NotFoundError || error.errorCode === 'USER_NOT_FOUND' || error.name === 'NotFoundError' || error.message?.includes('not found')) {
              // Create new user
              await firestoreService.createUser(userData);
              results.created++;
              logger.debug(`Created user: ${userId}`);
            } else {
              throw error;
            }
          }
        } catch (error) {
          results.errors.push({
            index: i,
            error: error.message,
            data: user,
          });
          results.skipped++;
          logger.error(`Error processing user ${i}`, { error: error.message, user });
        }
      }

      logger.info('JSON import completed', results);

      return ApiResponse.success(res, results, `Import completed: ${results.created} created, ${results.updated} updated, ${results.skipped} skipped`);

    } catch (error) {
      next(error);
    }
  }
}

export default new ImportController();

