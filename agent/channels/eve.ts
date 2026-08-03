import { eveChannel } from "eve/channels/eve";
import { localDev, none } from "eve/channels/auth";

// Navi is a public portfolio navigator. The browser still validates every proposal.
export default eveChannel({ auth: [localDev(), none()] });
