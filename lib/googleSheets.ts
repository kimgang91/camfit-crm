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
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: CAMPING_DB_SPREADSHEET_ID,
      range: 'A:Z', // 전체 데이터 가져오기
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return [];
    }

    // 첫 번째 행은 헤더
    const headers = rows[0] as string[];
    const data = rows.slice(1).map((row, index) => {
      const item: any = { id: index + 1 };
      headers.forEach((header, colIndex) => {
        item[header] = row[colIndex] || '';
      });
      return item;
    });

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

// MD 컨택 정보 저장 (새로운 시트에 저장)
export async function saveContactInfo(contactData: {
  campingId: number;
  mdName: string;
  result: string;
  rejectionReason?: string;
  content: string;
  contactDate: string;
}) {
  try {
    const sheets = getSheetsClient();
    
    // 시트가 없으면 생성
    await ensureMDContactsSheet();
    
    // 'MD_Contacts' 시트에 데이터 추가
    const range = 'MD_Contacts!A:F';
    const values = [[
      contactData.campingId,
      contactData.mdName,
      contactData.result,
      contactData.rejectionReason || '',
      contactData.content,
      contactData.contactDate,
    ]];

    await sheets.spreadsheets.values.append({
      spreadsheetId: CAMPING_DB_SPREADSHEET_ID,
      range,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values,
      },
    });
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
