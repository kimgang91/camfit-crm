import { google } from 'googleapis';

// Google Sheets API 클라이언트 초기화
function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
}

// 캠핑장 DB 스프레드시트 ID
const CAMPING_DB_SPREADSHEET_ID = '1_laE9Yxj-tajY23k36z3Bg2A_Mds8_V2A81DHnrUO68';
const CAMPING_DB_SHEET_ID = '907098998'; // gid

// 캠핏 입점 리스트 스프레드시트 ID
const CAMPFIT_LIST_SPREADSHEET_ID = '1PHX-Qyk1KrlB8k9r9hEqUckUuQT3PGfu-vJI1R22XyA';

// 캠핑장 리스트 가져오기
export async function getCampingList() {
  try {
    const sheets = getSheetsClient();
    
    // 시트 목록 확인하여 올바른 시트 찾기
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: CAMPING_DB_SPREADSHEET_ID,
    });
    
    // 모든 시트 목록 출력 (디버깅용)
    const allSheets = spreadsheet.data.sheets || [];
    console.log('Available sheets:', allSheets.map(s => ({
      title: s.properties?.title,
      sheetId: s.properties?.sheetId,
      index: s.properties?.index
    })));
    
    // gid는 URL 파라미터이지만, 실제로는 첫 번째 시트를 사용하거나
    // 시트 이름을 알고 있다면 직접 지정
    // 일단 첫 번째 시트 사용 (또는 시트 이름이 있다면 지정)
    const targetSheet = allSheets[0];
    const sheetName = targetSheet?.properties?.title || 'Sheet1';
    console.log(`Using sheet: ${sheetName}`);
    
    // 시트의 데이터 가져오기
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: CAMPING_DB_SPREADSHEET_ID,
      range: `${sheetName}!A:T`, // 시트 이름 명시
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log('No rows found in spreadsheet');
      return [];
    }

    console.log(`Total rows fetched: ${rows.length}`);

    // 헤더 찾기 (3번째 행이 헤더인 것으로 보임, 인덱스 2)
    let headerRowIndex = 2; // 기본값: 3번째 행 (인덱스 2)
    
    // 헤더 확인: '캠핑장명' 또는 '구 분'이 포함된 행 찾기
    for (let i = 0; i < Math.min(5, rows.length); i++) {
      if (rows[i] && Array.isArray(rows[i])) {
        const rowText = rows[i].join(' ');
        if (rowText.includes('캠핑장명') || rowText.includes('구 분')) {
          headerRowIndex = i;
          console.log(`Header found at row index: ${headerRowIndex}`);
          break;
        }
      }
    }

    if (!rows[headerRowIndex]) {
      console.error('Header row not found');
      return [];
    }

    const headers = rows[headerRowIndex] as string[];
    console.log(`Headers: ${headers.join(', ')}`);

    // 헤더 다음 행부터 데이터 시작 (4번째 행은 빈 행일 수 있으므로 필터링)
    const dataRows = rows.slice(headerRowIndex + 1);
    console.log(`Data rows (after header): ${dataRows.length}`);

    const data = dataRows
      .map((row, index) => {
        // 행이 비어있는지 확인 (모든 셀이 비어있거나 공백만 있는 경우)
        const hasData = row && Array.isArray(row) && row.some((cell: any) => {
          const cellValue = String(cell || '').trim();
          return cellValue !== '' && cellValue !== 'undefined' && cellValue !== 'null';
        });

        if (!hasData) {
          return null;
        }

        const item: any = { 
          id: index + 1,
          rowNumber: headerRowIndex + index + 2 // 실제 스프레드시트 행 번호
        };
        
        headers.forEach((header, colIndex) => {
          if (header && header.trim() !== '') {
            const cellValue = row[colIndex];
            item[header.trim()] = cellValue !== undefined && cellValue !== null ? String(cellValue).trim() : '';
          }
        });
        
        return item;
      })
      .filter((item) => item !== null); // null 제거

    console.log(`Processed data items: ${data.length}`);
    return data;
  } catch (error) {
    console.error('Error fetching camping list:', error);
    throw error;
  }
}

// 캠핏 입점 리스트 가져오기
export async function getCampfitList() {
  try {
    const sheets = getSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: CAMPFIT_LIST_SPREADSHEET_ID,
      range: 'A:Z',
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return [];
    }

    const headers = rows[0] as string[];
    const data = rows.slice(1).map((row) => {
      const item: any = {};
      headers.forEach((header, colIndex) => {
        item[header] = row[colIndex] || '';
      });
      return item;
    });

    return data;
  } catch (error) {
    console.error('Error fetching campfit list:', error);
    throw error;
  }
}

// 셀 업데이트
export async function updateCell(
  spreadsheetId: string,
  range: string,
  value: string
) {
  try {
    const sheets = getSheetsClient();
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[value]],
      },
    });
  } catch (error) {
    console.error('Error updating cell:', error);
    throw error;
  }
}

// MD_Contacts 시트 생성 (없을 경우)
async function ensureMDContactsSheet() {
  try {
    const sheets = getSheetsClient();
    
    // 시트 목록 확인
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: CAMPING_DB_SPREADSHEET_ID,
    });

    const sheetExists = spreadsheet.data.sheets?.some(
      (sheet) => sheet.properties?.title === 'MD_Contacts'
    );

    if (!sheetExists) {
      // 시트 생성
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: CAMPING_DB_SPREADSHEET_ID,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: 'MD_Contacts',
                },
              },
            },
          ],
        },
      });

      // 헤더 추가
      await sheets.spreadsheets.values.update({
        spreadsheetId: CAMPING_DB_SPREADSHEET_ID,
        range: 'MD_Contacts!A1:F1',
        valueInputOption: 'RAW',
        requestBody: {
          values: [['campingId', 'mdName', 'result', 'rejectionReason', 'content', 'contactDate']],
        },
      });
    }
  } catch (error) {
    console.error('Error ensuring MD_Contacts sheet:', error);
    // 시트 생성 실패해도 계속 진행 (이미 존재할 수 있음)
  }
}

// MD 컨택 정보 저장 (원본 시트의 컨택MD, 최근컨택일, 내용 컬럼 업데이트)
export async function saveContactInfo(contactData: {
  campingId: number;
  rowNumber?: number;
  mdName: string;
  result: string;
  rejectionReason?: string;
  content: string;
  contactDate: string;
}) {
  try {
    const sheets = getSheetsClient();
    
    // MD_Contacts 시트에도 저장 (히스토리용)
    await ensureMDContactsSheet();
    const historyRange = 'MD_Contacts!A:F';
    const historyValues = [[
      contactData.campingId,
      contactData.mdName,
      contactData.result,
      contactData.rejectionReason || '',
      contactData.content,
      contactData.contactDate,
    ]];

    await sheets.spreadsheets.values.append({
      spreadsheetId: CAMPING_DB_SPREADSHEET_ID,
      range: historyRange,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: historyValues,
      },
    });

    // 원본 시트의 해당 행 업데이트 (rowNumber가 있는 경우)
    if (contactData.rowNumber) {
      // 컨택MD, 최근컨택일, 내용 컬럼 업데이트
      // 컬럼 위치: H(컨택MD), J(최근컨택일), K(내용)
      const updateRange = `H${contactData.rowNumber}:K${contactData.rowNumber}`;
      const updateValues = [[
        contactData.mdName,
        contactData.contactDate,
        contactData.content,
        contactData.result, // 내용 옆에 결과도 저장
      ]];

      await sheets.spreadsheets.values.update({
        spreadsheetId: CAMPING_DB_SPREADSHEET_ID,
        range: updateRange,
        valueInputOption: 'RAW',
        requestBody: {
          values: updateValues,
        },
      });
    }
  } catch (error) {
    console.error('Error saving contact info:', error);
    throw error;
  }
}

// MD 컨택 정보 가져오기
export async function getContactInfo() {
  try {
    const sheets = getSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: CAMPING_DB_SPREADSHEET_ID,
      range: 'MD_Contacts!A:F',
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return [];
    }

    const headers = ['campingId', 'mdName', 'result', 'rejectionReason', 'content', 'contactDate'];
    const data = rows.slice(1).map((row) => {
      const item: any = {};
      headers.forEach((header, colIndex) => {
        item[header] = row[colIndex] || '';
      });
      // 숫자로 변환
      if (item.campingId) {
        item.campingId = Number(item.campingId) || item.campingId;
      }
      return item;
    });

    return data;
  } catch (error: any) {
    // 시트가 없을 경우 빈 배열 반환
    if (error.code === 400 || error.message?.includes('Unable to parse range')) {
      return [];
    }
    console.error('Error fetching contact info:', error);
    return [];
  }
}
