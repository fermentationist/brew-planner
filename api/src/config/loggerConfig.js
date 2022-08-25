const loggerConfig = {
  domain: process.env.ELASTICSEARCH_LOGGING_DOMAIN,
  username: process.env.ELASTICSEARCH_LOGGING_USERNAME,
  password: process.env.ELASTICSEARCH_LOGGING_PASSWORD,
  testMode: process.env.TEST_MODE === "false" ? false : true,
  indexPrefix: "sh-plus-api-logs",
  blacklist: ["credit_card", "card_number", "cc_num"],
  excludePatterns: [/token/gi, /password/gi, /authorization/gi, /license/gi, /credit_card/gi, /card_number/gi, /cc_num/gi]
};

export default loggerConfig;
