export const EXAM_QUESTIONS = [
  {
    id: 1,
    he: "כאשר מקבצים את היתרה בהמתנה של החשבונות לפי ערים של הסניפים, איזו עיר מייצגת כ-40% מסך היתרות בהמתנה?",
    en: "When grouping by city (of the branches) the pending balance of the accounts, which city is representing 40% of the total pending balances?",
    query: `SELECT 
    b.CITY,
    SUM(a.PENDING_BALANCE) AS total_pending,
    ROUND(SUM(a.PENDING_BALANCE) * 100.0 / (SELECT SUM(PENDING_BALANCE) FROM ACCOUNT), 2) AS pct
FROM ACCOUNT a
JOIN BRANCH b ON a.OPEN_BRANCH_ID = b.BRANCH_ID
GROUP BY b.CITY
ORDER BY total_pending DESC;`,
    explain: "לכל חשבון יש סניף שבו נפתח. לכל סניף יש עיר. אנחנו מחברים חשבון לסניף שלו, מקבצים לפי עיר, מחברים את כל היתרות בהמתנה בכל עיר, ואז בודקים איזו עיר הכי קרובה ל-40% מכל הכסף בהמתנה.",
    answer: "ה. Salem (40.08%)",
    options: ["א. Waltham", "ב. Woburn", "ג. Quincy", "ד. Cambridge", "ה. Salem"],
  },
  {
    id: 2,
    he: "כאשר מקבצים את היתרה הזמינה של החשבונות לפי ערים של הסניפים, איזו עיר מייצגת כ-12.5% מסך היתרות הזמינות?",
    en: "When grouping by city (of the branches) the available balance of the accounts, which city is representing 12.5% of the total available balances?",
    query: `SELECT 
    b.CITY,
    SUM(a.AVAIL_BALANCE) AS total_avail,
    ROUND(SUM(a.AVAIL_BALANCE) * 100.0 / (SELECT SUM(AVAIL_BALANCE) FROM ACCOUNT), 2) AS pct
FROM ACCOUNT a
JOIN BRANCH b ON a.OPEN_BRANCH_ID = b.BRANCH_ID
GROUP BY b.CITY
ORDER BY total_avail DESC;`,
    explain: "אותו רעיון כמו בשאלה 1, רק הפעם סוכמים את היתרה הזמינה (הכסף שאפשר להשתמש בו עכשיו) במקום היתרה בהמתנה.",
    answer: "ה. Woburn (12.51%)",
    options: ["א. Waltham", "ב. Quincy", "ג. Cambridge", "ד. Salem", "ה. Woburn"],
  },
  {
    id: 3,
    he: "מהי כמות/סכום הטרנזקציות שבוצעו על החשבונות של לקוח מספר 9?",
    en: "What is the sum of the amount of transactions in the account of customer with CUST_ID = 9?",
    query: `SELECT SUM(t.AMOUNT) AS total_amount
FROM ACC_TRANSACTION t
JOIN ACCOUNT a ON t.ACCOUNT_ID = a.ACCOUNT_ID
WHERE a.CUST_ID = 9;`,
    explain: "מוצאים את כל החשבונות של לקוח 9, ואז את כל התנועות (טרנזקציות) על החשבונות האלה. בסוף מחברים את כל סכומי התנועות לסכום אחד.",
    answer: "ד. 300",
    options: ["א. 275", "ב. 650", "ג. 100", "ד. 300"],
  },
  {
    id: 4,
    he: "מה התפקיד (TITLE) של העובד שאין לו מנהל?",
    en: "What is the title of the employee that has no superior (SUPERIOR_EMP_ID is null)?",
    query: `SELECT EMP_ID, FIRST_NAME, LAST_NAME, TITLE
FROM EMPLOYEE
WHERE SUPERIOR_EMP_ID IS NULL;`,
    explain: "ברשימת העובדים יש שדה 'מנהל'. מחפשים את העובד היחיד שאין לו מנהל מעליו — הוא בראש הארגון.",
    answer: "ד. President",
    options: ["א. Treasurer", "ב. CEO", "ג. VP", "ד. President"],
  },
  {
    id: 5,
    he: "מה שם המחלקה שלא משויך אליה שום עובד?",
    en: "What is the NAME of the department that no employee is attached to?",
    query: `SELECT d.DEPT_ID, d.NAME
FROM DEPARTMENT d
LEFT JOIN EMPLOYEE e ON d.DEPT_ID = e.DEPT_ID
WHERE e.EMP_ID IS NULL;`,
    explain: "עוברים על כל המחלקות ובודקים אם יש להן עובד. המחלקה שנשארת בלי אף עובד — זו התשובה.",
    answer: "ב. IT",
    options: ["א. Operations", "ב. IT", "ג. Loans", "ד. Administration"],
  },
  {
    id: 6,
    he: "מה מספר החשבון של לקוח עסקי שהשנה ב-INCORP_DATE גדולה מ-2001?",
    en: "What is the account_id of the business customer whose INCORP_DATE is over the year 2001?",
    query: `SELECT a.ACCOUNT_ID
FROM CUSTOMER c
JOIN BUSINESS b ON c.CUST_ID = b.CUST_ID
JOIN ACCOUNT a ON c.CUST_ID = a.CUST_ID
WHERE YEAR(b.INCORP_DATE) > 2001;`,
    explain: "מחברים לקוח עסקי ← פרטי העסק ← החשבונות שלו. בוחרים רק עסקים שהתאגדו אחרי שנת 2001, ומחזירים את מספר החשבון.",
    answer: "ג. 28",
    options: ["א. 10", "ב. 34", "ג. 28", "ד. 15"],
  },
  {
    id: 7,
    he: "באיזו עיר גר הלקוח הפרטי ששם המשפחה שלו Spencer?",
    en: "In which city does the Individual customer called Spencer as LAST_NAME lives?",
    query: `SELECT c.CITY
FROM INDIVIDUAL i
JOIN CUSTOMER c ON i.CUST_ID = c.CUST_ID
WHERE i.LAST_NAME = 'Spencer';`,
    explain: "מחברים טבלת אנשים פרטיים לטבלת לקוחות (אותו מספר לקוח). מחפשים מי ששם המשפחה Spencer ולוקחים את העיר שלו.",
    answer: "ד. Waltham",
    options: ["א. Melbourne", "ב. Woburn", "ג. Lynnfield", "ד. Waltham"],
  },
  {
    id: 8,
    he: "מה שם הלקוח העסקי שיש לו יתרה זמינה של למעלה מ-40,000$?",
    en: "What is the name of the business customer that has an available balance of over $40,000?",
    query: `SELECT b.NAME, a.AVAIL_BALANCE
FROM BUSINESS b
JOIN ACCOUNT a ON b.CUST_ID = a.CUST_ID
WHERE a.AVAIL_BALANCE > 40000;`,
    explain: "מחברים עסקים לחשבונות שלהם, ובודקים מי מהם יש לו יתרה זמינה מעל 40,000 דולר.",
    answer: "ד. AAA Insurance Inc.",
    options: ["א. Chilton Engineering", "ב. Northeast Cooling Inc.", "ג. Superior Auto Body", "ד. AAA Insurance Inc."],
  },
  {
    id: 9,
    he: "מה מספר העובד של העובד החדש ביותר בארגון (תאריך ההתחלה האחרון)?",
    en: "What is the EMP_ID of the employee whose start_date is the most recent?",
    query: `SELECT EMP_ID, FIRST_NAME, LAST_NAME, START_DATE
FROM EMPLOYEE
ORDER BY START_DATE DESC
LIMIT 1;`,
    explain: "מסדרים את כל העובדים לפי תאריך התחלת העבודה — מהחדש לישן — ולוקחים את הראשון ברשימה.",
    answer: "ד. 7 (Chris Tucker, 2004-09-15)",
    options: ["א. 10", "ב. 18", "ג. 8", "ד. 7"],
  },
  {
    id: 10,
    he: "מה מספר העובד של המנהל שמנהל תחתיו את המספר הרב ביותר של עובדים?",
    en: "What is the EMP_ID of the manager with the most employees in their team?",
    query: `SELECT e.SUPERIOR_EMP_ID AS manager_emp_id,
       m.FIRST_NAME, m.LAST_NAME, COUNT(*) AS team_size
FROM EMPLOYEE e
JOIN EMPLOYEE m ON e.SUPERIOR_EMP_ID = m.EMP_ID
GROUP BY e.SUPERIOR_EMP_ID, m.FIRST_NAME, m.LAST_NAME
ORDER BY team_size DESC;`,
    explain: "סופרים לכל מנהל כמה עובדים מדווחים אליו ישירות. המנהל עם הכי הרבה כפופים — זו התשובה (Susan Hawthorne, מספר 4).",
    answer: "א. 4",
    options: ["א. 4", "ב. 3", "ג. 9", "ד. 11"],
  },
  {
    id: 11,
    he: "מה שם המחלקה שמכילה את הכמות הגדולה ביותר של עובדים?",
    en: "What is the name of the department with the most employees in it?",
    query: `SELECT d.NAME, COUNT(e.EMP_ID) AS emp_count
FROM DEPARTMENT d
JOIN EMPLOYEE e ON d.DEPT_ID = e.DEPT_ID
GROUP BY d.DEPT_ID, d.NAME
ORDER BY emp_count DESC;`,
    explain: "מחברים מחלקות לעובדים, סופרים כמה עובדים יש בכל מחלקה, ובוחרים את המחלקה עם המספר הגבוה ביותר.",
    answer: "א. Operations (14 עובדים)",
    options: ["א. Operations", "ב. Administration", "ג. Marketing", "ד. Loans"],
  },
  {
    id: 12,
    he: "מהי שנת ה-INCORP_DATE של העסק שבו השם הפרטי של הפקיד הוא Stanley?",
    en: "What is the year of the INCORP_DATE of the business where the officer first name is Stanley?",
    query: `SELECT YEAR(b.INCORP_DATE) AS incorp_year
FROM OFFICER o
JOIN BUSINESS b ON o.CUST_ID = b.CUST_ID
WHERE o.FIRST_NAME = 'Stanley';`,
    explain: "מחברים פקיד (officer) לעסק שלו. מחפשים פקיד בשם Stanley ולוקחים את שנת ההתאגדות של העסק.",
    answer: "ד. 1999",
    options: ["א. 2000", "ב. 2006", "ג. 1998", "ד. 1999"],
  },
  {
    id: 13,
    he: "כמה עובדים משויכים למחלקת Administration?",
    en: "How many employees are working for the department called Administration?",
    query: `SELECT COUNT(e.EMP_ID) AS emp_count
FROM EMPLOYEE e
JOIN DEPARTMENT d ON e.DEPT_ID = d.DEPT_ID
WHERE d.NAME = 'Administration';`,
    explain: "מוצאים את מחלקת Administration וסופרים כמה עובדים שייכים אליה.",
    answer: "ב. 3",
    options: ["א. 15", "ב. 3", "ג. 2", "ד. 18"],
  },
  {
    id: 14,
    he: "מהי שנת ה-INCORP_DATE של העסק שבו שם המשפחה של הפקיד הוא Lutz?",
    en: "What is the year of the INCORP_DATE of the business where the officer last name is Lutz?",
    query: `SELECT YEAR(b.INCORP_DATE) AS incorp_year
FROM OFFICER o
JOIN BUSINESS b ON o.CUST_ID = b.CUST_ID
WHERE o.LAST_NAME = 'Lutz';`,
    explain: "כמו בשאלה 12, רק הפעם מחפשים לפי שם משפחה Lutz במקום שם פרטי.",
    answer: "ב. 2002",
    options: ["א. 2005", "ב. 2002", "ג. 2000", "ד. 2003"],
  },
  {
    id: 15,
    he: "מה שם העיר שבה גרים הכי הרבה לקוחות?",
    en: "What is the name of the city with the most customers located in?",
    query: `SELECT CITY, COUNT(*) AS customer_count
FROM CUSTOMER
GROUP BY CITY
ORDER BY customer_count DESC;`,
    explain: "עוברים על כל הלקוחות, מקבצים לפי עיר מגורים, סופרים כמה לקוחות בכל עיר, ובוחרים את העיר עם הכי הרבה.",
    answer: "ד. Salem (4 לקוחות)",
    options: ["א. Newton", "ב. Paris", "ג. Woburn", "ד. Salem"],
  },
  {
    id: 16,
    he: "מהו סכום הטרנזקציות שבוצעו על החשבונות של לקוח מספר 6?",
    en: "What is the sum of the amount of transactions in the account of customer with CUST_ID = 6?",
    query: `SELECT SUM(t.AMOUNT) AS total_amount
FROM ACC_TRANSACTION t
JOIN ACCOUNT a ON t.ACCOUNT_ID = a.ACCOUNT_ID
WHERE a.CUST_ID = 6;`,
    explain: "מוצאים את כל החשבונות של לקוח 6 (John Spencer), ואז את כל התנועות עליהם. מחברים את כל הסכומים — 2 חשבונות × 100$ = 200$.",
    answer: "ג. 200",
    options: ["א. 300", "ב. 100", "ג. 200", "ד. 50"],
  },
  {
    id: 17,
    he: "באיזו עיר גר הלקוח הפרטי ששמו הפרטי הוא Louis?",
    en: "In which city does the Individual customer called Louis as FIRST_NAME lives?",
    query: `SELECT c.CITY
FROM INDIVIDUAL i
JOIN CUSTOMER c ON i.CUST_ID = c.CUST_ID
WHERE i.FIRST_NAME = 'Louis';`,
    explain: "מחברים לקוח פרטי לפרטי הכתובת שלו, מחפשים מי ששמו Louis, ולוקחים את העיר.",
    answer: "א. Salem",
    options: ["א. Salem", "ב. Waltham", "ג. Quincy", "ד. Tokyo"],
  },
  {
    id: 18,
    he: "מה מספר הלקוח שהיתרה הזמינה שלו שונה מהיתרה בהמתנה והפעילות האחרונה שלו משנת 2005?",
    en: "What is the CUST_ID of the customer whose AVAIL_BALANCE differs from PENDING_BALANCE and last activity is from 2005?",
    query: `SELECT a.CUST_ID, a.AVAIL_BALANCE, a.PENDING_BALANCE, a.LAST_ACTIVITY_DATE
FROM ACCOUNT a
WHERE a.AVAIL_BALANCE <> a.PENDING_BALANCE
  AND YEAR(a.LAST_ACTIVITY_DATE) = 2005;`,
    explain: "מחפשים חשבון שבו שני סוגי היתרה לא שווים (יש הבדל בין זמין להמתנה), וגם שהפעילות האחרונה הייתה בשנת 2005.",
    answer: "א. 5",
    options: ["א. 5", "ב. 10", "ג. 8", "ד. 7"],
  },
  {
    id: 19,
    he: "מה מספר העובד הבכיר ביותר בסניף Salem? (שאר העובדים בסניף מדווחים אליו, והמנהל שלו עובד בסניף אחר)",
    en: "What is the emp_id of the most superior employee of the branch in Salem?",
    query: `SELECT e.EMP_ID, e.FIRST_NAME, e.LAST_NAME, e.TITLE, e.SUPERIOR_EMP_ID
FROM EMPLOYEE e
JOIN BRANCH b ON e.ASSIGNED_BRANCH_ID = b.BRANCH_ID
WHERE b.CITY = 'Salem';`,
    explain: "מוצאים את כל העובדים בסניף Salem. Theresa Markham (16) היא Head Teller — שני ה-Tellers מדווחים אליה, והיא מדווחת למנהלת ב-Waltham.",
    answer: "ב. 16 (Theresa Markham)",
    options: ["א. 26", "ב. 16", "ג. 12", "ד. 5"],
  },
  {
    id: 20,
    he: "כמה חשבונות קשורים למוצר מסוג Insurance Offerings?",
    en: "How many accounts are related to a product type where product_type.name is Insurance Offerings?",
    query: `SELECT COUNT(*) AS account_count
FROM ACCOUNT a
JOIN PRODUCT p ON a.PRODUCT_CD = p.PRODUCT_CD
JOIN PRODUCT_TYPE pt ON p.PRODUCT_TYPE_CD = pt.PRODUCT_TYPE_CD
WHERE pt.NAME = 'Insurance Offerings';`,
    explain: "מחברים חשבון → מוצר → סוג מוצר. מחפשים סוג בשם Insurance Offerings. קיים במערכת אבל אין מוצרים ממנו — ולכן 0 חשבונות.",
    answer: "ג. 0",
    options: ["א. 24", "ב. 10", "ג. 0", "ד. 7"],
  },
];
