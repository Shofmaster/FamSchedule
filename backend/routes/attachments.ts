import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import type { Request, Response } from 'express'

const router = Router()

const UPLOAD_DIR = path.resolve(__dirname, '..', 'uploads')

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, UPLOAD_DIR)
  },
  filename(_req, file, cb) {
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    cb(null, `${unique}-${file.originalname}`)
  },
})

const upload = multer({ storage })

router.post('/', upload.single('file'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' })
  }
  res.json({ url: `/uploads/${req.file.filename}` })
})

export default router
