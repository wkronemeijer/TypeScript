import { NetworkInterfaceInfo, networkInterfaces } from "os";


type IpProtocol = NetworkInterfaceInfo["family"];

/** Retrieve the local IP where this server is accessible. */
export function getLocalIp(protocol: IpProtocol): string | undefined {
    const interfaces = networkInterfaces();
    
    for (var name in interfaces) {
        for (const info of interfaces[name]!) {
            if (info.family === protocol && !info.internal) {
                return info.address;
            }
        }
    }
}
