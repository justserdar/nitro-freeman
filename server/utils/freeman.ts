import morgan from 'morgan'
import userAgentParser from 'ua-parser-js'
import fs from 'fs'

const morganJSONFormat = () =>
  JSON.stringify({
    method: ':method',
    url: ':url',
    http_version: ':http-version',
    remote_addr: ':remote-addr',
    response_time: ':response-time',
    status: ':status',
    content_length: ':res[content-length]',
    '@timestamp': ':date[iso]',
    user_agent: ':user-agent',
    referrer: ':referrer',
    accept: ':req[accept]',
    accept_language: ':req[accept-language]',
    accept_encoding: ':req[accept-encoding]',
    host: ':req[host]',
  })



export const accessLogStream = fs.createWriteStream('access.log', { flags: 'a' });
export const logger = morgan(morganJSONFormat(), {
  stream: {
    write: (message) => {
      const data = JSON.parse(message);
      parseUserAgent(data);
      const logData = JSON.stringify(data);
      accessLogStream.write(logData + '\n');
      return true;
    },
  },
});


export const parseUserAgent = function (data) {
  if (data.user_agent) {
    const ua = userAgentParser(data.user_agent)
    if (ua.browser) {
      data.user_agent_browser_name = ua.browser.name
      data.user_agent_browser_version = ua.browser.major || ua.browser.version
    }
    if (ua.os) {
      data.user_agent_os_name = ua.os.name
      data.user_agent_os_version = ua.os.version
    }
  }
}