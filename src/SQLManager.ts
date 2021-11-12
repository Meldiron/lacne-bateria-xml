import mysql from "mysql2/promise";
import { Client } from "ssh2";

const dbServer = {
    host: process.env.DB_HOST || "localhost",
    port: +(process.env.DB_PORT || 3306),
    user: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_DATABASE || "mysql"
};

const tunnelConfig = {
    host: process.env.DB_SSH_HOST || "localhost",
    port: 22,
    username: process.env.DB_SSH_USER || "root",
    password: process.env.DB_SSH_PASSWORD || ""
}

const forwardConfig = {
    srcHost: '127.0.0.1',
    srcPort: 3306,
    dstHost: dbServer.host,
    dstPort: dbServer.port
};

const sshClient = new Client();

export const SSHConnection = new Promise<mysql.Connection>((resolve, reject) => {
    sshClient.on('ready', () => {
        sshClient.forwardOut(
            forwardConfig.srcHost,
            forwardConfig.srcPort,
            forwardConfig.dstHost,
            forwardConfig.dstPort,
            async (err, stream) => {
                if (err) reject(err);
                const updatedDbServer = {
                    ...dbServer,
                    stream
                };
                const connection = await mysql.createConnection(updatedDbServer);
                resolve(connection);
            });
    }).connect(tunnelConfig);
});