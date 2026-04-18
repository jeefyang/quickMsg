import fs from 'fs'
import path from "path"

const listDir = "./data/list"
const pageContentDir = "./data/page/content"
const pageConfigDir = "./data/page/config"


const fn = () => {
    if (!fs.existsSync(pageConfigDir)) {
        fs.mkdirSync(pageConfigDir, { recursive: true })
    }
    if (!fs.existsSync(pageContentDir)) {
        fs.mkdirSync(pageContentDir, { recursive: true })
    }

    if (!fs.existsSync(listDir)) {
        return
    }
    const listFileList = fs.readdirSync(listDir)
    for (let i = 0; i < listFileList.length; i++) {
        const fileName = listFileList[i]
        const j = JSON.parse(fs.readFileSync(path.join(listDir, fileName)))

        if (!fs.existsSync(path.join(pageConfigDir, fileName))) {
            const a = j.config
            fs.writeFileSync(path.join(pageConfigDir, fileName), JSON.stringify(a))
        }
        if (!fs.existsSync(path.join(pageContentDir, fileName))) {
            const a = { uuid: j.config.uuid, list: j.list }
            fs.writeFileSync(path.join(pageContentDir, fileName), JSON.stringify(a))
        }
    }
}

fn()