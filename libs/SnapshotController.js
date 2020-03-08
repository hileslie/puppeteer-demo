/*
 * @Descripttion: 调取 puppenter 来生成接收到的html 数据生成图片
 */
const crypto = require("crypto");
const PuppenteerHelper = require("./PuppenteerHelper");

const oneDay = 24 * 60 * 60;

class SnapshotController {
	constructor() {
		this.ctx = {};
	}
	/**
	 * 截图接口
	 * @param {Object} ctx 上下文
	 */
	async postSnapshotJson(ctx) {
		this.ctx = ctx;
		let result = {};
		console.log('ctx.method: ', ctx.method);
		if (ctx.method === 'POST') {
			result = await this.handleSnapshot(ctx);
			ctx.body = { code: 10000, message: "ok", result };
		}

	}

	async handleSnapshot() {
		const { ctx } = this;
		// const { html } = ctx.request.body; // html 是我们将要生成的海报图片的 HTML 实现代码字符串
		const html = "<h1>hello leslie</h1>";
		// 根据 html 做 sha256 的哈希作为 Redis Key
		const htmlRedisKey = crypto
			.createHash("sha256")
			.update(html)
			.digest("hex");

		try {
			// 首先看海报是否有绘制过的
			let result = await this.findImageFromCache(htmlRedisKey);

			// 获取缓存失败
			if (!result) {
				result = await this.generateSnapshot(htmlRedisKey);
			}

			return result;
		} catch (error) {
			ctx.status = 500;
			return ctx.throw(500, error.message);
		}
	}

	/**
	 * 判断kv中是否有缓存
	 * @param {String} htmlRedisKey kv存储的key
	 */
	async findImageFromCache(htmlRedisKey) {
		return false;
	}

	/**
	 * 生成截图
	 * @param {String} htmlRedisKey kv存储的key
	 */
	async generateSnapshot(htmlRedisKey) {
		const { ctx } = this;
		console.log(1)
		// const {
		// 	html,
		// 	width = 375,
		// 	height = 667,
		// 	quality = 80,
		// 	ratio = 2,
		// 	type: imageType = "jpeg"
		// } = ctx.request.body;
		const html = "<h1>hello leslie</h1>";
		const width = 375;
		const height = 667;
		const quality = 80;
		const ratio = 2;
		const imageType = "jpeg";

		if (!html) {
			return "html 不能为空";
		}

		let imgBuffer;
		try {
			imgBuffer = await PuppenteerHelper.createImg({
				html,
				width,
				height,
				quality,
				ratio,
				imageType,
				fileType: "path",
				htmlRedisKey
			});
		} catch (err) {
			// logger
			console.log(err);
		}
		console.log('imgBuffer: ', imgBuffer);
		let imgUrl;

		try {
			imgUrl = await this.uploadImage(imgBuffer);
			// 将海报图片路径存在 Redis 里
			await ctx.kvdsClient.setex(htmlRedisKey, oneDay, imgUrl);
		} catch (err) { }

		return {
			img: imgUrl || ""
		};
	}

	/**
	 * 上传图片到 CDN 服务
	 * @param {Buffer} imgBuffer 图片buffer
	 */
	async uploadImage(imgBuffer) {
		// upload image to cdn and return cdn url
	}
}

module.exports = SnapshotController;
