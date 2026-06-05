import fs from 'node:fs/promises';
import path from 'node:path';

async function fetchRemoteJobs(){
    console.log("🚀 开始抓取远程职位数据...");

    // 目标源：Remotive 的公开 API (限制抓取 50 条作为演示)
    const url = "https://remotive.com/api/remote-jobs?limit=50";

    try {
        // 1. 发起请求获取数据
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP 报错，状态码: ${response.status}`);
        }

        const data = await response.json();
        const rawJobs = data.jobs || [];

        // 2. 数据清洗 (瘦身)
        const cleanJobs = rawJobs.map(job => ({
            id: job.id,
            title: job.title,
            company: job.company_name,
            category: job.category,
            tags: job.tags ? job.tags.slice(0, 3) : [], // 最多保留 3 个标签
            url: job.url,
            date: job.publication_date,
            description: job.description
        }));

        // 3. 确保 data 目录存在并保存为 JSON 文件
        // Astro 项目一般可以把数据放在 src/data 或者公众的 public 目录下
        const dirPath = path.join(process.cwd(), 'src', 'data');
        await fs.mkdir(dirPath, { recursive: true });

        const filePath = path.join(dirPath, 'jobs.json');

        // 写入文件，参数 null, 2 是为了让 JSON 格式化得好看些
        await fs.writeFile(filePath, JSON.stringify(cleanJobs, null, 2), 'utf-8');

        console.log(`✅ 成功抓取并清洗了 ${cleanJobs.length} 个职位！`);
        console.log(`📁 数据已保存至: ${filePath}`);

    } catch (error) {
        console.error("❌ 抓取失败:", error);
    }
}

// 执行抓取
fetchRemoteJobs();
