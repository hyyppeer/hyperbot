import chalk from 'chalk';
import { Client } from './client';
import { Logger } from '../../util/logger';

export function logClient(client: Client) {
  client.client.on('message', (nick, to, text) => {
    const locator = chalk.grey(`${to} <- ${nick}`.padEnd(19, ' '));
    Logger.verbose('chat', `${locator}: ${text}`);
  });
  client.client.on('selfMessage', (to, text) => {
    const locator = chalk.grey(`${client.nickname} -> ${to}`.padEnd(19, ' '));
    Logger.verbose('chat', `${locator}: ${text}`);
  });
  client.client.on('action', (from, to, text) => {
    const locator = chalk.grey(`${to} *`);
    Logger.verbose('chat', `${locator} ${from} ${text}`);
  });
  client.client.on('+mode', (chan, by, mode, arg) => {
    Logger.verbose('chat', `${chan}: ${by} sets +${mode} on ${arg}`);
  });
  client.client.on('-mode', (chan, by, mode, arg) => {
    Logger.verbose('chat', `${chan}: ${by} sets -${mode} on ${arg}`);
  });
  client.client.on('notice', (nick, to, text) => {
    Logger.verbose('chat', `-> ${to}: -${nick || `${client.server}:${client.port}`}- ${text}`);
  });
  client.client.on('ctcp-version', (from, to) => {
    Logger.verbose('chat', `${from} -> ${to}: [VERSION]`);
  });
  client.client.on('invite', (chan, from) => {
    Logger.verbose('chat', `${from} has invited you to join ${chan}!`);
  });
  client.client.on('kick', (chan, nick, by, reason) => {
    Logger.verbose('chat', `${nick} was kicked from ${chan} by ${by} for ${reason}`);
  });
  client.client.on('part', (chan, nick, reason) => {
    Logger.verbose('chat', `${nick} has left ${chan}: ${reason}`);
  });
  client.client.on('join', (chan, nick) => {
    Logger.verbose('chat', `${nick} has joined ${chan}`);
  });
  client.client.on('motd', (motd) => {
    motd
      .split('\n')
      .filter((ln) => !!ln)
      .forEach((line) => Logger.verbose('motd', line));
  });
  client.client.on('topic', (channel, topic, nick) => {
    Logger.verbose('chat', `${chalk.grey(`Topic for (${channel}) set by (${nick}): `)}${topic}`);
  });
  client.client.on('whois', (info) => {
    Logger.verbose('whois', `${info.nick} is...`);
    Logger.verbose('whois', `in ${(info.channels || []).join(', ') || 'no channels.'}`);
    if (info.operator) Logger.verbose('whois', `operator: ${info.operator}`);
    Logger.verbose('whois', `${info.user}@${info.host}`);
    if (info.serverinfo) Logger.verbose('whois', `serverinfo: ${info.serverinfo}`);
    if (info.server) Logger.verbose('whois', `server: ${info.server}`);
    Logger.verbose('whois', `real name: ${info.realname}`);
  });
}
