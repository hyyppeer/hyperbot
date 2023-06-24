import chalk from 'chalk';
import { Client } from './client';
import { Logger } from '../../util/logger';

export function logClient(client: Client) {
  client.client.on('message', (nick, to, text) => {
    const locator = chalk.grey(`${to} <- ${nick}`.padStart(19, ' '));
    Logger.verbose('Chat', `${locator}: ${text}`);
  });
  client.client.on('selfMessage', (to, text) => {
    const locator = chalk.grey(`${client.nickname} -> ${to}`.padStart(19, ' '));
    Logger.verbose('Chat', `${locator}: ${text}`);
  });
  client.client.on('action', (from, to, text) => {
    const locator = chalk.grey(`${to} *`);
    Logger.verbose('Chat', `${locator} ${from} ${text}`);
  });
  client.client.on('+mode', (chan, by, mode, arg) => {
    Logger.verbose('Chat', `${chan}: ${by} sets +${mode} on ${arg}`);
  });
  client.client.on('-mode', (chan, by, mode, arg) => {
    Logger.verbose('Chat', `${chan}: ${by} sets -${mode} on ${arg}`);
  });
  client.client.on('notice', (nick, to, text) => {
    Logger.verbose('Chat', `-> ${to}: -${nick || `${client.server}:${client.port}`}- ${text}`);
  });
  client.client.on('ctcp-version', (from, to) => {
    Logger.verbose('Chat', `${from} -> ${to}: [VERSION]`);
  });
  client.client.on('invite', (chan, from) => {
    Logger.verbose('Chat', `${from} has invited you to join ${chan}!`);
  });
  client.client.on('kick', (chan, nick, by, reason) => {
    Logger.verbose('Chat', `${nick} was kicked from ${chan} by ${by} for ${reason}`);
  });
  client.client.on('part', (chan, nick, reason) => {
    Logger.verbose('Chat', `${nick} has left ${chan}: ${reason}`);
  });
  client.client.on('join', (chan, nick) => {
    Logger.verbose('Chat', `${nick} has joined ${chan}`);
  });
  client.client.on('motd', (motd) => {
    motd
      .split('\n')
      .filter((ln) => !!ln)
      .forEach((line) => Logger.verbose('Motd', line));
  });
  client.client.on('topic', (channel, topic, nick) => {
    Logger.verbose('Chat', `${chalk.grey(`Topic for (${channel}) set by (${nick}): `)}${topic}`);
  });
  client.client.on('whois', (info) => {
    Logger.verbose('Whois', `${info.nick} is...`);
    Logger.verbose('Whois', `in ${(info.channels || []).join(', ') || 'no channels.'}`);
    if (info.operator) Logger.verbose('Whois', `operator: ${info.operator}`);
    Logger.verbose('Whois', `${info.user}@${info.host}`);
    if (info.serverinfo) Logger.verbose('Whois', `serverinfo: ${info.serverinfo}`);
    if (info.server) Logger.verbose('Whois', `server: ${info.server}`);
    Logger.verbose('Whois', `real name: ${info.realname}`);
  });
}
