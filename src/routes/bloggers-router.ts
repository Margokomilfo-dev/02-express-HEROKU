import {Request, Response, Router} from 'express'
import {bloggersRepository} from '../repositories/bloggers-db-repository'
import {
    auth,
    inputValidationMiddleware,
    nameValueValidation,
    youtubeUrlValidation1, youtubeUrlValidation2
} from '../middlewares/input-validation-middleware'
import {postRepository} from '../repositories/posts-db-repository'

export const bloggersRouter = Router({})

bloggersRouter.get('/', async (req: Request, res: Response) => {
    const bloggers = await bloggersRepository.findBloggers(req.query.name?.toString())
    res.status(200).send(bloggers)
})

bloggersRouter.post('/',auth,
    nameValueValidation,
    youtubeUrlValidation1,
    youtubeUrlValidation2,
    inputValidationMiddleware, async(req: Request, res: Response) => {
        const name = req.body.name
        const youtubeUrl = req.body.youtubeUrl
        const blogger = await bloggersRepository.createBlogger(name, youtubeUrl)

        if (blogger) {
            res.status(201).send(blogger)
        } else {
            res.status(400).send({
                resultCode: 1,
                errorsMessages: [{message: 'blogger is not created', field: 'bloggerId'}]
            })
        }
    })

bloggersRouter.get('/:id', async (req: Request, res: Response) => {
    const id = +req.params.id
    if (!id) {
        res.send(400)
        return
    }
    const blogger = await bloggersRepository.findBloggerById(id)
    if (blogger) {
        res.send(blogger)
    } else {
        res.send(404)
    }

})
bloggersRouter.put('/:id',auth,
    nameValueValidation,
    youtubeUrlValidation1,
    youtubeUrlValidation2,
    inputValidationMiddleware, async (req: Request, res: Response) => {
        const id = parseInt(req.params.id)
        if (!id) {
            res.send(400)
            return
        }
        const name = req.body.name
        const youtubeUrl = req.body.youtubeUrl

        const isUpdated = await bloggersRepository.updateBlogger(id, name, youtubeUrl)
        if (isUpdated) {
            res.sendStatus(204)
        } else res.send(404)
    })

bloggersRouter.delete('/:id', auth,async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    if (!id) {
        res.send(400)
        return
    }
    const isDeleted = await bloggersRepository.deleteBlogger(id)
    await postRepository.deletePostsByBloggerId(id)
    if (isDeleted) {
        res.send(204)
    } else res.send(404)
})

