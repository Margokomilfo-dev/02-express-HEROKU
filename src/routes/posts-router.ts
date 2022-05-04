import {Request, Response, Router} from 'express'
import {postRepository} from '../repositories/posts-db-repository'
import {bloggersRepository} from '../repositories/bloggers-db-repository'
import {
    auth,
    bloggerIdValidation,
    contentValidation, inputValidationMiddleware,
    shortDescriptionValidation,
    titleValidation
} from '../middlewares/input-validation-middleware'

export const postsRouter = Router({})

postsRouter.get('/',async (req: Request, res: Response) => {
    const posts = await postRepository.getPosts()
    res.status(200).send(posts)
})
postsRouter.post('/',auth,
    titleValidation,
    shortDescriptionValidation,
    contentValidation,
    bloggerIdValidation,
    inputValidationMiddleware, async (req: Request, res: Response) => {
        const title = req.body.title
        const shortDescription = req.body.shortDescription
        const content = req.body.content
        const bloggerId = req.body.bloggerId
        const blogger = await bloggersRepository.findBloggerById(bloggerId)
        if (!blogger) {
            res.status(400).send({
                resultCode: 1,
                errorsMessages: [{message: 'no blogger with this id', field: 'bloggerId'}]
            })
            return
        }
        const newPost = await postRepository.createPost(title, shortDescription, content, bloggerId)
        if (newPost) {
            res.status(201).send(newPost)
        } else {
            res.status(400).send({
                resultCode: 1,
                errorsMessages: [{message: 'post is not created', field: 'bloggerId'}]
            })
        }
    })
postsRouter.get('/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    if (!id) {
        res.send(400)
        return
    }
    const post = await postRepository.getPostById(id)
    if (post) {
        res.send(post)
    } else {
        res.send(404)
    }
})
postsRouter.put('/:id',auth,
    titleValidation,
    shortDescriptionValidation,
    contentValidation,
    bloggerIdValidation,
    inputValidationMiddleware, async (req: Request, res: Response) => {
        const id = parseInt(req.params.id)
        if (!id) {
            res.send(400)
            return
        }
        const title = req.body.title
        const shortDescription = req.body.shortDescription
        const content = req.body.content
        const bloggerId = req.body.bloggerId

        const blogger = await bloggersRepository.findBloggerById(bloggerId)
        if (!blogger) {
           res.status(400).send({
                resultCode: 1,
                errorsMessages: [{message: 'blogger is not created', field: 'bloggerId'}]
            })
        }
        const isUpdated = await postRepository.updatePost(id, title, shortDescription, content, bloggerId)
        if (isUpdated) {
            res.sendStatus(204)
        } else res.send(404)
    })
postsRouter.delete('/:id', auth,async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    if (!id) {
        res.send(400)
        return
    }
    const isDeleted = await postRepository.deletePost(id)
    if (isDeleted) {
        res.send(204)
    } else res.send(404)
})