import { collection, addDoc, updateDoc, doc, query, where, getDocs } from "firebase/firestore";
import {firestore} from  "../../../firebase.config"
import useFirebaseAuth from "../../../auth/useFirebaseAuth";
import { useCallback, useRef } from "react";

type TDataStoreSchema = {
    contentId: string;    
    contentValue: string;    
    authUserId: string
    createdOn: Date;
    updatedOn: Date;
}

type TInputSchema = {
    contentValue: string;    
}

type TOutputSchema = TDataStoreSchema & {
    documentId: string;
}

const collectionName = "CMS"
const cmsCollectionRef = collection(firestore, collectionName)

const useCMS = ()=>{
    const {authUser} = useFirebaseAuth()
    const isInProgress = useRef(false)

    const getContent = useCallback(async (contentId: string)=>{
        console.log("useCMS > getContent", isInProgress.current)

        if(isInProgress.current)
            return;

        isInProgress.current = true
                
        const queryRef = query(cmsCollectionRef, where("contentId", "==", contentId))

        const docRefs = await getDocs(queryRef);

        if(docRefs.size == 0)
        {
            isInProgress.current = false

            console.error("Found no items with contentId")
            return null;
        }

        if(docRefs.size > 1)
        {
            isInProgress.current = false
            throw new Error("Found multiple items with the same contentId")
        }        

        const docRef = docRefs.docs[0];
        const docData: TDataStoreSchema = docRef.data() as TDataStoreSchema;

        if(!docData)
        {   
            isInProgress.current = false
            return null;
        }

        const response: TOutputSchema = {
            ...docData,
            contentId:docData.contentId,
            documentId: docRef.id
        }

        isInProgress.current = false
        return response;
    },[])
    
    const addContent = useCallback(async (contentId: string, contentParams: TInputSchema)=>{
        console.log("useCMS > addContent", isInProgress.current)

        if(isInProgress.current)
            return;

        isInProgress.current = false
        const docData = await getContent(contentId)
        isInProgress.current = true

        if(docData)
        {            
            isInProgress.current = false         
            return docData;
        }

        const dataSchema: TDataStoreSchema = {
            ...contentParams,
            contentId:contentId,
            authUserId: authUser?.uid ?? "",
            createdOn: new Date(),
            updatedOn: new Date()
        }

        await addDoc(cmsCollectionRef, dataSchema)

        isInProgress.current = false
        const docDataSchema = await getContent(contentId)
        isInProgress.current = true
        
        if(!docDataSchema){
            console.error("Error loading data")
            isInProgress.current = false         
            return null;
        }
        
        const newResponse: TOutputSchema = {
            ...docDataSchema
        }

        isInProgress.current = false         
        return newResponse
    },[authUser?.uid, getContent])

    const updateContent = useCallback(async (contentId: string, contentParams: TInputSchema)=>{
        console.log("useCMS > updateContent", isInProgress.current)

        if(isInProgress.current)
            return;

        const docData = await getContent(contentId)
        isInProgress.current = true        

        if(!docData)
        {          
            isInProgress.current = false         
            const content = await addContent(contentId, contentParams);  

            return content;
        }

        const docRef = doc(firestore, collectionName, docData.documentId)
        
        const dataSchema: TDataStoreSchema = {
            ...docData,
            ...contentParams, 
            authUserId: authUser?.uid ?? "",   
            updatedOn: new Date()
        }
        
        await updateDoc(docRef, dataSchema)

        isInProgress.current = false
        const updatedDocData = await getContent(contentId)        

        return updatedDocData;
    },[addContent, authUser?.uid, getContent])

    return { addContent, updateContent, getContent }
}

export default useCMS;