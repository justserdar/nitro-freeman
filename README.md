# Nitro - Freeman, the Logger 

Look at the [nitro quick start](https://nitro.unjs.io/guide#quick-start) to learn more how to get started.


My favorite logger, `Morgan` adapted into `Freeman` for Nitro with simple utils and middleware.
Credits to: 
- [OG Issuer](https://github.com/unjs/nitro/discussions/334#discussioncomment-6347102)
- [Adaptation](https://github.com/unjs/nitro/discussions/334#discussioncomment-6353721)

1. Create a new file in your `./server/utils` folder called `logger.ts` or in my case `freeman.ts`, not really relevant.
Add the following code:

```ts
import morgan from 'morgan'
import userAgentParser from 'ua-parser-js'
import fs from 'fs'

const morganJSONFormat = () => JSON.stringify({
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
      const data = JSON.parse(message); // Parse the log message
      parseUserAgent(data); // Process the parsed log data
      const logData = JSON.stringify(data); // Convert the processed data back to JSON
      accessLogStream.write(logData + '\n'); // Write the log data to the file
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
```

2. Create a new file in `./server/middleware/` called `log.ts` with the following content:
```ts
export default defineEventHandler((event) => {
    logger(event.node.req, event.node.res, function () {
        return
    })
})
```

That's it.
The log util should automagicaly fire with every incoming request or response
and append it too `access.log` at the root of your workspace.

Always use writeStreams and don't block the event loop with sync write to disk Ops.
If you want to optimize, forward your requests to another standalone Nitro server or third party service, 
just for logging. Or you could use Nitro Tasks (scheduled CRON jobs) to clean up the file every 24h.
