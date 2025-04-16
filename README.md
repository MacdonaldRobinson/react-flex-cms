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
