export const lang: Language = {
  name: 'US English',
  flag: 'US',
  key: 'en_US',
  dateTimeFormat: 'MMM do yyyy - HH:mm',
  tag: ['en_US', 'US', 'en', 'US English'],
  mapping: {
    // Common key:
    AGO: 'ago',
    GO_BACK: 'Go back',
    CREATE_NEW_WALLET: 'Create new wallet',
    IMPORT_WALLET: 'Access your wallet',
    WELCOME: 'Welcome to Kardia Wallet',
    GETTING_STARTED_DESCRIPTION:
      'To get started, choose one of the following options',
    SUBMIT: 'Submit',
    REQUIRED_FIELD: 'This field is required',
    COPY_TO_CLIPBOARD: 'Copy to clipboard',
    SECOND: 'sec',
    RESTART_APP_DESCRIPTION:
      'Kardia Wallet will restart to ensure your wallet is properly imported',
    ARE_YOU_SURE: 'Are you sure ?',
    SAVE: 'Save',
    CLOSE: 'Close',
    SCAN_QR_FOR_ADDRESS: 'Scan QR code for address',
    // Create wallet key:
    SUBMIT_CREATE: 'Understood. Access my wallet now',
    MNEMONIC_DESCRIPTION:
      'Above 24 words will be used to recover as well as access your wallet.',
    // Import wallet key:
    ENTER_SEED_PHRASE: 'Enter secret phrase',
    SCAN_SEED_PHRASE: 'Scan QR code for mnemonic phrase',
    WALLET_EXISTED: 'Wallet already existed',
    ERROR_SEED_PHRASE: 'Wrong format seed phrase, please recheck',
    // Transaction key
    RECENT_TRANSACTION: 'Recent transactions',
    NO_TRANSACTION: 'No transaction',
    SEARCH_TRANSACTION_PLACEHOLDER:
      'Search with address / tx hash / block number / block hash...',
    VIEW_ALL_TRANSACTION: 'View all',
    SEND: 'Send KAI',
    RECEIVE: 'Receive KAI',
    TRANSACTION_HASH: 'Transaction hash',
    TRANSACTION_DETAIL: 'Detail',
    TRANSACTION_AMOUNT: 'Amount',
    TRANSACTION_FEE: 'Transaction fee',
    FROM: 'From',
    TO: 'To',
    TRANSACTION_DATE: 'Transaction date',
    CREATE_TX_ADDRESS: 'Send to address',
    CREATE_TX_KAI_AMOUNT: 'Amount (maximum: 5,000,000,000)',
    TRANSACTION_SPEED: 'Choose transaction speed',
    SLOW_SPEED: 'Slow',
    AVERAGE_SPEED: 'Average',
    FAST_SPEED: 'Fast',
    GAS_PRICE: 'Gas price',
    GAS_LIMIT: 'Gas limit',
    SPEED_DESCRIPTION:
      '* Accelerating a transaction by using a higher gas price increases its chances of getting processed by the network faster, but it is not always guaranteed.',
    CONFIRM_TRANSACTION: 'Confirm your transaction',
    CONFIRM_KAI_AMOUNT: 'Amount',
    CONFIRM: 'Confirm',
    // Wallet key
    IMPORT: 'Import',
    WALLET: 'Wallet',
    ADDRESS: 'Address',
    REMOVE_WALLET: 'Remove wallet',
    // News key
    NEWS_SCREEN_TITLE: 'News',
    // Setting key
    SETTING_SCREEN_TITLE: 'Setting',
    ADDRESS_BOOK_MENU: 'Address book',
    LANGUAGE_MENU: 'Language setting',
    LANGUAGE_SETTING_TITLE: 'Choose display language',
    SECRET_PHRASE_MENU: 'Export secret phrase',
    MNEMONIC_SETTING_TITLE: 'Secret phrase',
    SHOW_SECRET_TEXT: 'Show my secret phrase',
    ADDRESS_NAME: 'Name',
    ADDRESS_ADDRESS: 'Address',
    // Error boundary key
    ERROR_BOUNDARY_TITLE: 'Oops, Something Went Wrong',
    ERROR_BOUNDARY_DESCRIPTION:
      'The app ran into a problem and could not continue. We apologise for any inconvenience this has caused! Press the button below to restart the app and sign back in. Please contact us if this issue persists.',
    NOT_ENOUGH_BALANCE: 'The amount exceed your wallet balance.',
  },
};
