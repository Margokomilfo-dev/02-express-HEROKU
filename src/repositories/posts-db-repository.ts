import {bloggersRepository} from './bloggers-db-repository'
import {posts} from './db'
import {PostType} from './posts-repository'

export const postRepository = {
    async getPosts() {
        return posts.find({},{projection:{_id:0}}).toArray()
    },
    async deletePostsByBloggerId(bloggerId: number) {
        return posts.deleteMany({bloggerId})
    },
    async createPost(title: string, descr: string, content: string, bloggerId: number) {
        const blogger = await bloggersRepository.findBloggerById(bloggerId)
        const newPost: PostType = {
            id: +(new Date()),
            title,
            shortDescription: descr,
            content,
            bloggerId,
            bloggerName: blogger?.name
        }

        const created = await posts.insertOne(newPost,{forceServerObjectId:true})
        if (created) {
            return newPost
        } else return null
    },
    async getPostById(id: number) {
        const post = await posts.findOne({id},{projection:{_id:0}})
        if (post) {
            return post
        } else return null
    },

    async updatePost(id: number, title: string, descr: string, content: string, bloggerId: number) {
        const post = await posts.findOne({id})

        if (!post) {
            return false
        }
        const blogger = await bloggersRepository.findBloggerById(bloggerId)
        await posts.findOneAndUpdate(
            {id},
            {$set: {title, shortDescription: descr, content, bloggerId, bloggerName: blogger?.name}},
            {upsert: true}
        )
        return true
    },

    async deletePost(id: number) {
        const isDeleted = await posts.deleteOne({id})
        return isDeleted.deletedCount > 0
    }
}