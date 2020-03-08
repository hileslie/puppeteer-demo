/*
 * @Descripttion: 创建生成图片类
 */
const puppeteer = require('puppeteer')
const { mkdirsSync, formatNumber } = require('../utils/utils')

class PuppenteerHelper {
    async createImg(params) {
        const browser = await puppeteer.launch({
            headless: false, // 默认为 true 不打开浏览器，设置 false 打开
        })
        const date = new Date()
        const path = `static/upload/${date.getFullYear()}/${formatNumber(date.getMonth() + 1)}`
        mkdirsSync(path)
        // 通过创建浏览器标签来打开
        const page = await browser.newPage()
        // 设置视窗大小
        await page.setViewport({
            width: params.width,
            height: params.height,
            deviceScaleFactor: params.ratio
        })
        // 设置需要截图的html内容
        await page.setContent(params.html)
        await this.waitForNetworkIdle(page, 50)
        let filePath
        // 根据 type 返回不同的类型 一种图片路径、一种 base64
        if (params.fileType === 'path') {
            filePath = `${path}/${params.htmlRedisKey}.${params.imageType}`
            await page.screenshot({
                path: filePath,
                fullPage: false,
                omitBackground: true
            })
        } else {
            filePath = await page.screenshot({
                fullPage: false,
                omitBackground: true,
                encoding: 'base64'
            })
        }
        browser.close()
        return filePath
    }
    // 等待HTML 页面资源加载完成
    waitForNetworkIdle(page, timeout, maxInflightRequests = 0) {
        page.on('request', onRequestStarted);
        page.on('requestfinished', onRequestFinished);
        page.on('requestfailed', onRequestFinished);

        let inflight = 0;
        let fulfill;
        let promise = new Promise(x => fulfill = x);
        let timeoutId = setTimeout(onTimeoutDone, timeout);
        return promise;

        function onTimeoutDone() {
            page.removeListener('request', onRequestStarted);
            page.removeListener('requestfinished', onRequestFinished);
            page.removeListener('requestfailed', onRequestFinished);
            fulfill();
        }

        function onRequestStarted() {
            ++inflight;
            if (inflight > maxInflightRequests)
                clearTimeout(timeoutId);
        }

        function onRequestFinished() {
            if (inflight === 0)
                return;
            --inflight;
            if (inflight === maxInflightRequests)
                timeoutId = setTimeout(onTimeoutDone, timeout);
        }
    }
}
module.exports = new PuppenteerHelper()
