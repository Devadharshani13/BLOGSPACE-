import CreatePost from '../CreatePost/CreatePost'

// EditPost reuses CreatePost with the ID from the URL params
export default function EditPost() {
  return <CreatePost />
}
