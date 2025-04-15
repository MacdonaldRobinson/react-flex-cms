import { useState } from "react"
import {auth}  from"../firebase.config"
import {signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User} from "firebase/auth"

const useFirebaseAuth = ()=>{            
    const [authUser, setUser]  = useState<User | null>()
    
    const login = async ()=>{
        await signInWithPopup(auth, new GoogleAuthProvider())
    }

    const logout = async ()=>{
        await signOut(auth)        
    }

    onAuthStateChanged(auth, (user: User | null)=>{
        setUser(user)
    })

    return {login, logout, authUser}
    
}

export default useFirebaseAuth;