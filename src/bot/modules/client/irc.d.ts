import { Socket } from 'net';

interface Irc {
  colors: {
    wrap(color: string, text: string, reset_color?: string): string;
    codes: {
      white: 'u000300';
      black: 'u000301';
      dark_blue: 'u000302';
      dark_green: 'u000303';
      light_red: 'u000304';
      dark_red: 'u000305';
      magenta: 'u000306';
      orange: 'u000307';
      yellow: 'u000308';
      light_green: 'u000309';
      cyan: 'u000310';
      light_cyan: 'u000311';
      light_blue: 'u000312';
      light_magenta: 'u000313';
      gray: 'u000314';
      light_gray: 'u000315';
      reset: 'u000f';
    };
  };
  Client: new (server: string, nick: string, options: IrcOptions) => IrcClient;
}

interface IrcOptions {
  userName?: string;
  realName?: string;
  port?: number;
  localAddress?: unknown;
  debug?: boolean;
  showErrors?: boolean;
  autoRejoin?: boolean;
  autoConnect?: boolean;
  channels: string[];
  secure?: boolean;
  selfSigned?: boolean;
  certExpired?: boolean;
  floodProtection?: boolean;
  floodProtectionDelay?: number;
  sasl?: boolean;
  retryCount?: number;
  retryDelay?: number;
  stripColors?: boolean;
  channelPrefixes?: string;
  messageSplit?: string;
  encoding?: string;
  password?: string;
}

interface WhoisInfo {
  nick: string;
  user: string;
  host: string;
  realname: string;
  channels: string[];
  server: string;
  serverinfo: string;
  operator: string;
}

interface ChannelInfo {
  name: string;
  users: number;
  topic: string;
}

interface Message {
  prefix?: string;
  nick?: string;
  user?: string;
  host?: string;
  server: string;
  rawCommand: string;
  command: string;
  commandType: 'normal' | 'error' | 'reply';
  args: string[];
}

interface Nicks {
  [nick: string]: '@' | '+' | '~' | '';
}

interface Chans {
  [chan: string]: {
    key: string;
    serverName: string;
    users: Nicks;
    modeParams: unknown; //is object, tbd
    topic: string;
    mode: string;
    topicBy: string;
    created: string;
  };
}

interface IrcClient extends IrcClientFunctions, IrcEvents {}

interface IrcClientFunctions {
  send(command: string, ...args: any[]): void;
  join(channel: string, callback?: () => void): void;
  part(channel: string, message?: string, callback?: () => void): void;
  say(target: string, message: string): void;
  ctcp(target: string, type: string, text: string): void;
  action(target: string, message: string): void;
  notice(target: string, message: string): void;
  whois(nick: string, callback?: (info: WhoisInfo) => void): void;
  list(...args: any[]): void;
  connect(retryCount?: number, callback?: () => void): void;
  disconnect(message?: string, callback?: () => void): void;
  activateFloodProtection(interval: number): void;
  nick: string;
  chans: Chans;
  conn: Socket;
  _whoisData(): unknown;
  _addWhoisData(data: WhoisInfo): void;
  _clearWhoisData(): void;
}

interface IrcEvents {
  on(event: 'registered', callback: (message: Message) => void): void;
  on(event: 'motd', callback: (motd: string) => void): void;
  on(event: 'names', callback: (channel: string, nicks: Nicks) => void): void;
  on(event: `names#${string}`, callback: (nicks: Nicks) => void): void;
  on(event: 'topic', callback: (channel: string, topic: string, nick: string, message: Message) => void): void;
  on(event: 'join', callback: (channel: string, nick: string, message: Message) => void): void;
  on(event: `join#${string}`, callback: (nick: string, message: Message) => void): void;
  on(event: 'part', callback: (channel: string, nick: string, reason: string, message: Message) => void): void;
  on(event: `part#${string}`, callback: (nick: string, reason: string, message: Message) => void): void;
  on(event: 'quit', callback: (nick: string, reason: string, channels: string[], message: Message) => void): void;
  on(event: 'kick', callback: (channel: string, nick: string, by: string, reason: string, message: Message) => void): void;
  on(event: `kick#${string}`, callback: (nick: string, by: string, reason: string, message: Message) => void): void;
  on(event: 'kill', callback: (nick: string, reason: string, channels: string[], message: Message) => void): void;
  on(event: 'message', callback: (nick: string, to: string, text: string, message: Message) => void): void;
  on(event: 'message#', callback: (nick: string, to: string, text: string, message: Message) => void): void;
  on(event: `message#${string}`, callback: (nick: string, text: string, message: Message) => void): void;
  on(event: 'selfMessage', callback: (to: string, text: string) => void): void;
  on(event: 'notice', callback: (nick: string, to: string, text: string, message: Message) => void): void;
  on(event: 'ping', callback: (server: string) => void): void;
  on(event: 'pm', callback: (nick: string, text: string, message: Message) => void): void;
  on(event: 'ctcp', callback: (from: string, to: string, text: string, type: 'notice' | 'privmsg', message: Message) => void): void;
  on(event: 'ctcp-notice', callback: (from: string, to: string, text: string, message: Message) => void): void;
  on(event: 'ctcp-privmsg', callback: (from: string, to: string, text: string, message: Message) => void): void;
  on(event: 'ctcp-version', callback: (from: string, to: string, message: Message) => void): void;
  on(event: 'nick', callback: (oldnick: string, newnick: string, channels: string, message: Message) => void): void;
  on(event: 'invite', callback: (channel: string, from: string, message: Message) => void): void;
  on(event: '+mode', callback: (channel: string, by: string, mode: string, argument: string, message: Message) => void): void;
  on(event: '-mode', callback: (channel: string, by: string, mode: string, argument: string, message: Message) => void): void;
  on(event: 'whois', callback: (info: WhoisInfo) => void): void;
  on(event: 'channellist_start', callback: () => void): void;
  on(event: 'channellist_item', callback: (channel_info: ChannelInfo) => void): void;
  on(event: 'channellist', callback: (channel_list: ChannelInfo[]) => void): void;
  on(event: 'raw', callback: (message: Message) => void): void;
  on(event: 'error', callback: (message: Message) => void): void;
  on(event: 'action', callback: (from: string, to: string, text: string, message: Message) => void): void;
}
