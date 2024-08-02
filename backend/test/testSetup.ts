import toBeWithinSecondsOfDate from './utils/matchers/toBeWithinSecondsOfDate';
import toEqualDateIgnoringTime from './utils/matchers/toEqualDateIgnoringTime';
import toMatchProduct from './utils/matchers/toMatchProduct';
import toMatchStock from './utils/matchers/toMatchStock';

expect.extend({
	toMatchProduct,
	toBeWithinSecondsOfDate,
	toMatchStock,
	toEqualDateIgnoringTime,
});

process.env.ACCESS_TOKEN_ENCRYPTION_KEY = 'MOCK_ACCESS_TOKEN';

process.env.UNTAPPD_BASE_URL = 'MOCK_UNTAPPD_URL';
process.env.UNTAPPD_CLIENT_ID = 'MOCK_CLIENT_ID';
process.env.UNTAPPD_CLIENT_SECRET = 'MOCK_CLIENT_SECRET';
