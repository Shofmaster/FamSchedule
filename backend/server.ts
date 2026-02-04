import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import path from 'path'
import googleRouter from './routes/google'
import attachmentsRouter from './routes/attachments'
import errorHandler from './middleware/errorHandler'

dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') })

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(cookieParser())
app.use(express.json())

app.use('/uploads', express.static(path.resolve(__dirname, 'uploads')))
app.use('/api/google', googleRouter)
app.use('/api/attachments', attachmentsRouter)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`)
})

export default app
