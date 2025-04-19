I have published an npm package for this project here: https://www.npmjs.com/package/flex-cms

If you do not see a tinymce folder in your public folder run the following script

```node
npm install flex-cms
```

If you dont see a tinymce folder in your public directory run the following or copy it from node_modules/flex-cms/build/tinymce: 

```
node node_modules\flex-cms\postinstall.js 
```

---

There are 2 components exposed:

```javascript
import { AuthButton, EditableContent } from "flex-cms";
```

AuthButton: You need to login using this inorder to save changes and toggle the Editor

```html
<AuthButton />
```

EditableContent: Simply wrap the content you want to make editable with this

```html
<EditableContent contentId="ContentId">
    Test
</EditableContent>
```

NOTE: Currently any requests from "localhost" are allowed so you can test
