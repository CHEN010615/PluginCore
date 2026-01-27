import { fileURLToPath } from 'url'
import path, { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url);

class Common {
  constructor() {
    this.dev = process.env.NODE_ENV === "development"
    this.dirname = path.join(dirname(__filename), '../');
  }
}

export default new Common();