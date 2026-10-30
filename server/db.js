const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'cellon.db');
const db = new Database(dbPath);

// Enable foreign keys and WAL mode for high performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initDatabase() {
  console.log('Initializing CellOn XI Database...');

  // Create Schema
  db.exec(`
    CREATE TABLE IF NOT EXISTS Company (
      ID INTEGER PRIMARY KEY,
      Name TEXT,
      Address TEXT,
      Phone TEXT,
      Displaycaption TEXT,
      flgParent INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS Login (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      Name TEXT,
      LoginName TEXT UNIQUE,
      Password TEXT,
      IsAdmin INTEGER DEFAULT 1,
      CompanyID INTEGER,
      flgAllCompanies INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS Category (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      Name TEXT,
      Description TEXT
    );

    CREATE TABLE IF NOT EXISTS Color (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      Name TEXT
    );

    CREATE TABLE IF NOT EXISTS StockLocation (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      Name TEXT,
      Description TEXT
    );

    CREATE TABLE IF NOT EXISTS Warranty (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      Name TEXT,
      Description TEXT
    );

    CREATE TABLE IF NOT EXISTS Chart_of_Accts (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      AccountNo TEXT UNIQUE,
      Title TEXT,
      GroupID INTEGER,
      Level INTEGER,
      OpenDrBal REAL DEFAULT 0,
      OpenCrBal REAL DEFAULT 0,
      Balance REAL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS Trader (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      Name TEXT,
      AccountID INTEGER,
      Customer INTEGER DEFAULT 1,
      CardsSupplier INTEGER DEFAULT 0,
      ConectionSupplier INTEGER DEFAULT 0,
      NicNo TEXT,
      Ph TEXT,
      City TEXT,
      Address TEXT,
      LimitAmount REAL DEFAULT 0,
      CreditDays INTEGER DEFAULT 0,
      FOREIGN KEY (AccountID) REFERENCES Chart_of_Accts(ID)
    );

    CREATE TABLE IF NOT EXISTS Items (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      Name TEXT,
      Description TEXT,
      Charges REAL DEFAULT 0,
      CateryID INTEGER,
      Discount REAL DEFAULT 0,
      PurchasePrice REAL DEFAULT 0,
      flgAccessories INTEGER DEFAULT 0,
      ReorderLevel REAL DEFAULT 5,
      FOREIGN KEY (CateryID) REFERENCES Category(ID)
    );

    CREATE TABLE IF NOT EXISTS DetItem (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      MobNo TEXT UNIQUE,
      HItemID INTEGER,
      Stock INTEGER DEFAULT 1,
      PurchasePrice REAL DEFAULT 0,
      SalePrice REAL DEFAULT 0,
      WarrantyID INTEGER,
      LocationID INTEGER,
      CompanyID INTEGER DEFAULT 1,
      Date TEXT,
      FOREIGN KEY (HItemID) REFERENCES Items(ID),
      FOREIGN KEY (WarrantyID) REFERENCES Warranty(ID),
      FOREIGN KEY (LocationID) REFERENCES StockLocation(ID)
    );

    CREATE TABLE IF NOT EXISTS HItemPurchase (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      BillNo INTEGER UNIQUE,
      Date TEXT,
      AccountID INTEGER,
      Value REAL DEFAULT 0,
      RefNo TEXT,
      CompanyID INTEGER DEFAULT 1,
      UserID INTEGER,
      FOREIGN KEY (AccountID) REFERENCES Chart_of_Accts(ID)
    );

    CREATE TABLE IF NOT EXISTS DetItemPurchase (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      HPurchaseID INTEGER,
      Det_Item_ID INTEGER,
      Price REAL DEFAULT 0,
      CompanyID INTEGER DEFAULT 1,
      FOREIGN KEY (HPurchaseID) REFERENCES HItemPurchase(ID) ON DELETE CASCADE,
      FOREIGN KEY (Det_Item_ID) REFERENCES DetItem(ID)
    );

    CREATE TABLE IF NOT EXISTS HItemSale (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      BillNo INTEGER UNIQUE,
      Date TEXT,
      BillTime TEXT,
      AccountID INTEGER,
      Value REAL DEFAULT 0,
      Discount REAL DEFAULT 0,
      NetTotal REAL DEFAULT 0,
      CompanyID INTEGER DEFAULT 1,
      UserID INTEGER,
      FOREIGN KEY (AccountID) REFERENCES Chart_of_Accts(ID)
    );

    CREATE TABLE IF NOT EXISTS DetItemSale (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      HSaleID INTEGER,
      Det_Item_ID INTEGER,
      Price REAL DEFAULT 0,
      CompanyID INTEGER DEFAULT 1,
      flgReturned INTEGER DEFAULT 0,
      FOREIGN KEY (HSaleID) REFERENCES HItemSale(ID) ON DELETE CASCADE,
      FOREIGN KEY (Det_Item_ID) REFERENCES DetItem(ID)
    );

    CREATE TABLE IF NOT EXISTS HItemReturn (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      BillNo INTEGER UNIQUE,
      Date TEXT,
      AccountID INTEGER,
      Value REAL DEFAULT 0,
      CompanyID INTEGER DEFAULT 1,
      UserID INTEGER
    );

    CREATE TABLE IF NOT EXISTS DetItemReturn (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      HReturnID INTEGER,
      Det_Item_ID INTEGER,
      Price REAL DEFAULT 0,
      CompanyID INTEGER DEFAULT 1,
      FOREIGN KEY (HReturnID) REFERENCES HItemReturn(ID) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS HTransfer (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      BillNo INTEGER UNIQUE,
      Date TEXT,
      ToCompanyID INTEGER,
      Value REAL DEFAULT 0,
      CompanyID INTEGER DEFAULT 1,
      UserID INTEGER
    );

    CREATE TABLE IF NOT EXISTS DetTransfer (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      HTransferID INTEGER,
      DetItemID INTEGER,
      Price REAL DEFAULT 0,
      CompanyID INTEGER DEFAULT 1,
      FOREIGN KEY (HTransferID) REFERENCES HTransfer(ID) ON DELETE CASCADE,
      FOREIGN KEY (DetItemID) REFERENCES DetItem(ID)
    );

    /* CellON IMS 13 Installment System Tables */
    CREATE TABLE IF NOT EXISTS HInstallment (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      ContractNo TEXT UNIQUE,
      Date TEXT,
      CustomerAccountID INTEGER,
      HSaleID INTEGER,
      PlanMonths INTEGER DEFAULT 6,
      TotalAmount REAL DEFAULT 0,
      AdvancePayment REAL DEFAULT 0,
      RemainingAmount REAL DEFAULT 0,
      MonthlyEMI REAL DEFAULT 0,
      PaymentDay INTEGER DEFAULT 5,
      StartDate TEXT,
      RecoveryOfficerID INTEGER DEFAULT 1,
      Status TEXT DEFAULT 'ACTIVE',
      Notes TEXT,
      FOREIGN KEY (CustomerAccountID) REFERENCES Chart_of_Accts(ID)
    );

    CREATE TABLE IF NOT EXISTS DetInstallment (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      HInstallmentID INTEGER,
      InstallmentNo INTEGER,
      DueDate TEXT,
      Amount REAL DEFAULT 0,
      PaidAmount REAL DEFAULT 0,
      PaidDate TEXT,
      Status TEXT DEFAULT 'DUE',
      Notes TEXT,
      FOREIGN KEY (HInstallmentID) REFERENCES HInstallment(ID) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Guarantor (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      TraderID INTEGER,
      CustomerAccountID INTEGER,
      Name TEXT,
      FatherName TEXT,
      NicNo TEXT,
      Mobile TEXT,
      Address TEXT,
      Relation TEXT,
      ChequeDetails TEXT,
      CreatedDate TEXT
    );

    CREATE TABLE IF NOT EXISTS CustomerCheque (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      TraderID INTEGER,
      BankName TEXT,
      ChequeNo TEXT,
      Amount REAL DEFAULT 0,
      DueDate TEXT,
      Status TEXT DEFAULT 'SECURITY'
    );

    CREATE TABLE IF NOT EXISTS CallCenterLog (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      HInstallmentID INTEGER,
      CustomerAccountID INTEGER,
      Date TEXT,
      CallerName TEXT,
      CustomerFeedback TEXT,
      PromisedDate TEXT,
      PromisedAmount REAL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS InstallmentReceipt (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      ReceiptNo TEXT UNIQUE,
      Date TEXT,
      HInstallmentID INTEGER,
      CustomerAccountID INTEGER,
      AmountReceived REAL DEFAULT 0,
      CashAmount REAL DEFAULT 0,
      BankAmount REAL DEFAULT 0,
      BankName TEXT,
      Remarks TEXT,
      UserID INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS Journal (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      DocNo INTEGER,
      DocType TEXT,
      Particular TEXT,
      Ref TEXT,
      AccountID INTEGER,
      Debit REAL DEFAULT 0,
      Credit REAL DEFAULT 0,
      Date TEXT,
      CompanyID INTEGER DEFAULT 1,
      UserID INTEGER,
      FOREIGN KEY (AccountID) REFERENCES Chart_of_Accts(ID)
    );

    CREATE TABLE IF NOT EXISTS HCashDrVoucher (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      VoucherNo INTEGER UNIQUE,
      Date TEXT,
      Description TEXT,
      Total REAL DEFAULT 0,
      CompanyID INTEGER DEFAULT 1,
      UserID INTEGER
    );

    CREATE TABLE IF NOT EXISTS DetCDrVoucher (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      H_VoucherID INTEGER,
      AccountID INTEGER,
      Particular TEXT,
      Amount REAL DEFAULT 0,
      FOREIGN KEY (H_VoucherID) REFERENCES HCashDrVoucher(ID) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS HCashCrVoucher (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      VoucherNo INTEGER UNIQUE,
      Date TEXT,
      Description TEXT,
      Total REAL DEFAULT 0,
      CompanyID INTEGER DEFAULT 1,
      UserID INTEGER
    );

    CREATE TABLE IF NOT EXISTS DetCCrVoucher (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      H_VoucherID INTEGER,
      AccountID INTEGER,
      Particular TEXT,
      Amount REAL DEFAULT 0,
      FOREIGN KEY (H_VoucherID) REFERENCES HCashCrVoucher(ID) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS HBPVoucher (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      VoucherNo INTEGER UNIQUE,
      Date TEXT,
      BankAccountID INTEGER,
      Description TEXT,
      Total REAL DEFAULT 0,
      CompanyID INTEGER DEFAULT 1,
      UserID INTEGER
    );

    CREATE TABLE IF NOT EXISTS DetBPVoucher (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      H_VoucherID INTEGER,
      AccountID INTEGER,
      Particular TEXT,
      Amount REAL DEFAULT 0,
      FOREIGN KEY (H_VoucherID) REFERENCES HBPVoucher(ID) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS HRebate (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      Date TEXT,
      AccountID INTEGER,
      TotalRebate REAL DEFAULT 0,
      CompanyID INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS DetRebate (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      HRebateID INTEGER,
      DetItemID INTEGER,
      OldPrice REAL,
      RebateAmount REAL,
      NewPrice REAL,
      FOREIGN KEY (HRebateID) REFERENCES HRebate(ID) ON DELETE CASCADE,
      FOREIGN KEY (DetItemID) REFERENCES DetItem(ID)
    );
  `);

  // Seed default company & admin if not exists
  const companyCount = db.prepare('SELECT count(*) as cnt FROM Company').get().cnt;
  if (companyCount === 0) {
    db.prepare(`
      INSERT INTO Company (ID, Name, Address, Phone, Displaycaption, flgParent)
      VALUES (1, 'HAMZA PHONE STORE', 'Shop #12, Mobile Market, Hall Road, Lahore', '0300-1234567', 'HAMZA PHONE STORE (Main Branch)', 1)
    `).run();
    console.log('Seeded default Company.');
  }

  const userCount = db.prepare('SELECT count(*) as cnt FROM Login').get().cnt;
  if (userCount === 0) {
    db.prepare(`
      INSERT INTO Login (Name, LoginName, Password, IsAdmin, CompanyID)
      VALUES ('Administrator', 'admin', '123', 1, 1)
    `).run();
    console.log('Seeded default Login: admin / 123');
  }

  // Seed Categories
  const catCount = db.prepare('SELECT count(*) as cnt FROM Category').get().cnt;
  if (catCount === 0) {
    const insertCat = db.prepare('INSERT INTO Category (Name, Description) VALUES (?, ?)');
    insertCat.run('Smartphones', 'Android & iOS Mobile Phones');
    insertCat.run('Feature Phones', 'Keypad & Basic Phones');
    insertCat.run('Accessories', 'Chargers, Cables, Airpods & Cases');
    insertCat.run('Tablets & iPads', 'Tablets and iPads');
  }

  // Seed Warranties
  const warrCount = db.prepare('SELECT count(*) as cnt FROM Warranty').get().cnt;
  if (warrCount === 0) {
    const insertW = db.prepare('INSERT INTO Warranty (Name, Description) VALUES (?, ?)');
    insertW.run('Official 1-Year Brand Warranty', 'Authorized distributor local warranty');
    insertW.run('7-Days Checking Warranty', 'Store testing warranty');
    insertW.run('Non-PTA / No Warranty', 'As-is unit');
  }

  // Seed Colors
  const colorCount = db.prepare('SELECT count(*) as cnt FROM Color').get().cnt;
  if (colorCount === 0) {
    const insertC = db.prepare('INSERT INTO Color (Name) VALUES (?)');
    ['Titanium Black', 'Natural Titanium', 'Midnight Blue', 'Phantom Gray', 'Alpine White', 'Starlight', 'Forest Green'].forEach(c => insertC.run(c));
  }

  // Seed Stock Locations
  const locCount = db.prepare('SELECT count(*) as cnt FROM StockLocation').get().cnt;
  if (locCount === 0) {
    const insertL = db.prepare('INSERT INTO StockLocation (Name, Description) VALUES (?, ?)');
    insertL.run('Main Counter', 'Front sales display counter');
    insertL.run('Safe Vault', 'High-value safe');
    insertL.run('Warehouse A', 'Back office stock room');
  }

  // Seed Chart of Accounts
  const coaCount = db.prepare('SELECT count(*) as cnt FROM Chart_of_Accts').get().cnt;
  if (coaCount === 0) {
    const insertCoa = db.prepare('INSERT INTO Chart_of_Accts (AccountNo, Title, GroupID, Level, OpenDrBal, OpenCrBal) VALUES (?, ?, ?, ?, ?, ?)');
    insertCoa.run('10101', 'Cash in Hand', 1, 3, 250000, 0);
    insertCoa.run('10102', 'Meezan Bank Ltd (A/C: 0102030405)', 1, 3, 1500000, 0);
    insertCoa.run('10201', 'Merchandise Inventory (Handsets)', 1, 3, 5000000, 0);
    insertCoa.run('20101', 'Airlink Communication Ltd (Vendor)', 2, 3, 0, 1200000);
    insertCoa.run('20102', 'M&P Distribution (Vendor)', 2, 3, 0, 850000);
    insertCoa.run('30101', 'Al-Madina Mobile Wholesale (Customer)', 3, 3, 450000, 0);
    insertCoa.run('30102', 'Bismillah Telecom (Customer)', 3, 3, 280000, 0);
    insertCoa.run('40101', 'Handset Sales Revenue', 4, 3, 0, 0);
    insertCoa.run('40102', 'Accessories Sales Revenue', 4, 3, 0, 0);
    insertCoa.run('50101', 'Cost of Goods Sold (Purchases)', 5, 3, 0, 0);
    insertCoa.run('50201', 'Shop Rent & Utilities Expense', 5, 3, 0, 0);
    insertCoa.run('50202', 'Staff Salaries Expense', 5, 3, 0, 0);
    insertCoa.run('40201', 'Brand Price Protection Rebate Income', 4, 3, 0, 0);

    // Seed Trader links
    const insertTrader = db.prepare('INSERT INTO Trader (Name, AccountID, Customer, CardsSupplier, NicNo, Ph, City, Address, LimitAmount, CreditDays) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    insertTrader.run('Airlink Communication Ltd', 4, 0, 0, '35201-1234567-1', '042-35876543', 'Lahore', 'Gulberg III, Lahore', 5000000, 30);
    insertTrader.run('M&P Distribution', 5, 0, 0, '35202-9876543-1', '042-35789123', 'Lahore', 'Davis Road, Lahore', 4000000, 15);
    insertTrader.run('Al-Madina Mobile Wholesale', 6, 1, 0, '35201-5544332-1', '0321-4455667', 'Lahore', 'Shop #45, Hafeez Centre', 1000000, 7);
    insertTrader.run('Bismillah Telecom', 7, 1, 0, '35202-7788991-1', '0300-9988776', 'Faisalabad', 'Katchery Bazar, Faisalabad', 800000, 7);
  }

  // Seed Handset Items
  const itemsCount = db.prepare('SELECT count(*) as cnt FROM Items').get().cnt;
  if (itemsCount === 0) {
    const insertItem = db.prepare('INSERT INTO Items (Name, Description, Charges, CateryID, PurchasePrice, flgAccessories) VALUES (?, ?, ?, ?, ?, ?)');
    insertItem.run('Apple iPhone 16 Pro Max 256GB', 'Apple flagship device, Official PTA Approved', 0, 1, 485000, 0);
    insertItem.run('Samsung Galaxy S24 Ultra 512GB', 'Snapdragon 8 Gen 3, Titanium Gray', 0, 1, 395000, 0);
    insertItem.run('Xiaomi Redmi Note 13 Pro 8/256GB', 'Mid-range champion, 200MP camera', 0, 1, 62000, 0);
    insertItem.run('Vivo V30 5G 12/256GB', 'Aura Light portrait, Peacock Green', 0, 1, 125000, 0);
    insertItem.run('Infinix Note 40 Pro 8/256GB', 'MagCharge wireless charging', 0, 1, 58000, 0);
    insertItem.run('Apple 20W USB-C Power Adapter', 'Genuine Apple fast charger', 0, 3, 5500, 1);
  }

  // Seed Initial Stock of Handset IMEIs in DetItem
  const detCount = db.prepare('SELECT count(*) as cnt FROM DetItem').get().cnt;
  if (detCount === 0) {
    const insertDet = db.prepare(`
      INSERT INTO DetItem (MobNo, HItemID, Stock, PurchasePrice, SalePrice, WarrantyID, LocationID, CompanyID, Date)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, date('now'))
    `);

    // Sample handsets with realistic 15-digit IMEIs
    insertDet.run('358742110984521', 1, 1, 485000, 498000, 1, 2);
    insertDet.run('358742110984522', 1, 1, 485000, 498000, 1, 2);
    insertDet.run('358742110984523', 1, 1, 485000, 498000, 1, 2);

    insertDet.run('354921098712341', 2, 1, 395000, 408000, 1, 1);
    insertDet.run('354921098712342', 2, 1, 395000, 408000, 1, 1);

    insertDet.run('864902051239871', 3, 1, 62000, 65500, 1, 1);
    insertDet.run('864902051239872', 3, 1, 62000, 65500, 1, 1);
    insertDet.run('864902051239873', 3, 1, 62000, 65500, 1, 1);
    insertDet.run('864902051239874', 3, 1, 62000, 65500, 1, 1);

    insertDet.run('869012069812345', 4, 1, 125000, 131000, 1, 1);
    insertDet.run('869012069812346', 4, 1, 125000, 131000, 1, 1);

    console.log('Seeded sample mobile handset IMEIs in DetItem.');
  }

  // Seed CellON IMS Installment Contracts if empty
  const instCount = db.prepare('SELECT count(*) as cnt FROM HInstallment').get().cnt;
  if (instCount === 0) {
    const insertHInst = db.prepare(`
      INSERT INTO HInstallment (ContractNo, Date, CustomerAccountID, HSaleID, PlanMonths, TotalAmount, AdvancePayment, RemainingAmount, MonthlyEMI, PaymentDay, StartDate, RecoveryOfficerID, Status, Notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertDetInst = db.prepare(`
      INSERT INTO DetInstallment (HInstallmentID, InstallmentNo, DueDate, Amount, PaidAmount, PaidDate, Status, Notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Contract 1: Al-Madina Mobile Wholesale (AccountID 6) - Vivo V30 on 6-month plan
    insertHInst.run('IMS-1001', '2026-08-05', 6, 1, 6, 132000, 24000, 108000, 18000, 5, '2026-08-05', 1, 'ACTIVE', 'Vivo V30 12/256GB Peacock Green');
    insertDetInst.run(1, 1, '2026-09-05', 18000, 18000, '2026-09-05', 'PAID', 'Received in Cash');
    insertDetInst.run(1, 2, '2026-10-05', 18000, 18000, '2026-10-06', 'PAID', 'Meezan Bank Transfer');
    insertDetInst.run(1, 3, '2026-11-05', 18000, 0, null, 'DUE', 'Upcoming November EMI');
    insertDetInst.run(1, 4, '2026-12-05', 18000, 0, null, 'DUE', 'December EMI');
    insertDetInst.run(1, 5, '2027-01-05', 18000, 0, null, 'DUE', 'January EMI');
    insertDetInst.run(1, 6, '2027-02-05', 18000, 0, null, 'DUE', 'February Final EMI');

    // Contract 2: Bismillah Telecom (AccountID 7) - Redmi Note 13 Pro on 4-month plan (OVERDUE)
    insertHInst.run('IMS-1002', '2026-07-10', 7, 2, 4, 68000, 12000, 56000, 14000, 10, '2026-07-10', 2, 'ACTIVE', 'Redmi Note 13 Pro 8/256GB');
    insertDetInst.run(2, 1, '2026-08-10', 14000, 14000, '2026-08-11', 'PAID', 'JazzCash received');
    insertDetInst.run(2, 2, '2026-09-10', 14000, 14000, '2026-09-15', 'PAID', 'Late paid');
    insertDetInst.run(2, 3, '2026-10-10', 14000, 0, null, 'OVERDUE', 'Overdue by 20 days - Call customer');
    insertDetInst.run(2, 4, '2026-11-10', 14000, 0, null, 'DUE', 'November Final EMI');

    // Seed Guarantors
    const insertGuarantor = db.prepare(`
      INSERT INTO Guarantor (TraderID, CustomerAccountID, Name, FatherName, NicNo, Mobile, Address, Relation, ChequeDetails, CreatedDate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, date('now'))
    `);
    insertGuarantor.run(3, 6, 'Muhammad Tariq Khan', 'Abdul Majeed', '35201-8899771-3', '0321-9988771', 'Gulshan-e-Ravi, Lahore', 'Brother', 'Meezan Bank Cheque #982134');
    insertGuarantor.run(4, 7, 'Haji Abdul Rehman', 'Ghulam Rasool', '35202-3344551-5', '0301-4433221', 'Madina Town, Faisalabad', 'Business Partner', 'HBL Cheque #004512');

    // Seed Call Center Logs
    const insertCall = db.prepare(`
      INSERT INTO CallCenterLog (HInstallmentID, CustomerAccountID, Date, CallerName, CustomerFeedback, PromisedDate, PromisedAmount)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    insertCall.run(2, 7, '2026-10-25', 'Usman Ali (RO)', 'Customer requested 5 days time due to salary delay', '2026-10-31', 14000);

    console.log('Seeded CellON IMS Installment plans and schedule.');
  }

  console.log('CellOn XI Database Ready.');
}

module.exports = { db, initDatabase };
