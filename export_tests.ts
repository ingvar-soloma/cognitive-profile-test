import { AVAILABLE_SURVEYS } from './constants';
import * as fs from 'fs';

fs.writeFileSync('./backend/tests_seed.json', JSON.stringify(AVAILABLE_SURVEYS, null, 2));
console.log('Tests exported to backend/tests_seed.json');
