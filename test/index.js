const WebSocket = require('ws');

const codes = {
    // Misc.
    0: "ok",
    1: "keep-alive",
    2: "keep-alive-but-do-not-reponse",
    // Client
    1001: "exchange-info",
    1002: "exchange-peers",
    1003: "exchange-blacklist-peers",
    1004: "exchange-cache",
    1101: "client-info",
    // Server
    2001: "server-exchange-info",
    2002: "server-exchange-peers",
    2003: "server-exchange-blacklist-peers",
    2004: "server-exchange-info",
    2101: "server-info",
    // Client Errors
    3001: "client-bad-request",
    3002: "client-keep-alive-timeout",
    3003: "client-already-register",
    // Server Errors
    4001: "server-bad-response",
    4002: "server-keep-alive-timeout",
    4003: "server-operation-denied"
}

const JSON2String = (json) => JSON.stringify(json)
const Map2JSON = (map) => map.keys().map(s => ({ key: s, value: map.get(s) }))

class Infomation {
    constructor() {

        /**
         * Code of the infomation
         * @type number
         */
        this.code = 0;

        /**
         * Data of the infomation
         * @type Object
         */
        this.data = {}
    }
}

const http = require('http');

class P2PE {
    constructor(ip, port) {
        this.defPeer = {
            ip: "localhost",
            port: 8080
        }

        this.wsUrl = port ? `ws://${ip}:${port}` : `ws://${ip}`
        this.wsSrv = new WebSocket.Server({ port })
        this.wsCnt = null;

        this.cache = new Map()
        this.peers = new Map()
        this.blacklistPeers = new Map()

        this.init()
    }

    init() {
        var self = this;

        /**
         * @param {WebSocket} ws
         * @param {http.IncomingMessage} req
         */
        this.wsSrv.on("connection", (ws, req) => {
           ws.on("message", message => {
               var msg = null;
               try {
                   msg = JSON.parse(message)
               } catch (e) {
                   ws.send(JSON2String({ code: 3001 }))
                   return ws.close()
               }

               switch (msg.code) {
                    case 0:
                        break;
                    case 1:
                        ws.send(JSON2String({ code: 2 }))
                        break;
                    case 2:
                        ws.send(JSON2String({ code: 0 }))
                        break;
                    case 1001:
                        if (Array.from(self.peers.keys()).includes(msg.ip + ":" + msg.port)) return ws.send(JSON2String({ code: 3003 }))
                        if (Array.from(self.blacklistPeers.keys()).includes(msg.ip + ":" + msg.port)) return;
                        ws.send(JSON2String({ code: 0 }))
                        break;
                    case 1002: 
                        ws.send(JSON2String({ code: 2002, data: Map2JSON(this.peers) }))
                        break;
                    case 1003:
                        ws.send(JSON2String({ code: 2003, data: Map2JSON(this.blacklistPeers) }))
                        break;
                    case 1004:
                        ws.send(JSON2String({ code: 2003, data: Map2JSON(this.blacklistPeers) }))
                        break;
                    case 1101:
                        ws.send(JSON2String({ code: 0 }))
                        break;
               }
           })  
        })
        this.wsCnt = new WebSocket(`ws://${this.defPeer.ip}:${this.defPeer.port}`)

        self.wsCnt.on("open", () => {
            self.wsCnt.send(JSON2String({ code: 1001, data: JSON2String({ ip: self.ip, port: self.port }) }))
        })

        self.wsCnt.on("message", console.log)
    }

    /**
     * Push peer to this.peers if peer is not in this.blacklistPeers and this.peers
     * @param {WebSocket} peer 
     * @param {http.IncomingMessage} req
     */
    handleNewPeer(peer, req) {
        if (this.peers.includes(req.remoteAddress)) return;
        if (this.blacklistPeers.includes(req.remoteAddress)) return;
        this.peers.set(req.remoteAddress, peer)
    }

    /**
     * Broadcast the infomation to all peers in this.peers
     * @param {Infomation} info
     */
    broadcast(info) {
        var self = this;
        this.peers.forEach(peer => {
            peer.send(JSON2String({ code: info.code, data: info.data }))
        })
    }

    /**
     * Broadcast the infomation that you got from a new init client to this.peers, if the client in this.blacklistPeers, do nothing.
     * if this.peers.size == 0, do nothing.
     * if client is in this.peers, do not send to client.
     * @param {WebSocket} client - client
     * @param {Infomation} info
     */
    broadcastNewClientInfomation(client, info) {
        var self = this;
        if (this.blacklistPeers.has(client.remoteAddress)) return;
        if (this.peers.has(client.remoteAddress)) return;

        this.peers.forEach(peer => {
            if (peer.remoteAddress != client.remoteAddress) {
                peer.send(JSON2String({ code: info.code, data: info.data }))
            }
        })
    }

    /**
     * Broadcast new client's infomation to all peers in this.peers,
     * if the client in this.blacklistPeers, do nothing.
     * if this.peers.size == 0, do nothing.
     * if client is in this.peers, do not send to client.
     * @param {http.IncomingMessage} client - client
     * @param {Infomation} info
     */
    broadcastNewClientInfomationToAllPeers(client, info) {
        var self = this;
        if (this.blacklistPeers.has(client.remoteAddress)) return;
        if (this.peers.has(client.remoteAddress)) return;

        this.peers.forEach(peer => {
            if (peer.remoteAddress != client.remoteAddress) {
                peer.send(JSON2String({ code: info.code, data: info.data }))
            }
        })
    }
}

if (!require.main) {
    var peer = new P2PE("localhost", 8080)
    setTimeout(() => console.log(peer.peers), 5000);
}
