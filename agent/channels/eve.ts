import { eveChannel } from "eve/channels/eve";
import { localDev, none } from "eve/channels/auth";

// Navi may propose any registered website capability. The browser still validates
// and executes every proposal locally.
export default eveChannel({ auth: [localDev(), none()] });
