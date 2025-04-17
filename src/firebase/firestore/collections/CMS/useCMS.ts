import { collection, addDoc, updateDoc, doc, query, where, getDocs } from "firebase/firestore";
import {firestore, auth} from  "../../../firebase.config"
import useFirebaseAuth from "../../../auth/useFirebaseAuth";
import { useCallback, useRef } from "react";

type TDataStoreSchema = {
    contentId: string;
    contentValue: string;
    authUserId: string
    createdOn: Date;
    updatedOn: Date;
    pageUrl: string;
}

type TInputSchema = {
    contentValue: string;    
}

type TOutputSchema = TDataStoreSchema & {
    documentId: string;
}

const collectionName = "CMS"
const contentsPath: string[] = [window.location.hostname, "contents"]

const cmsCollectionRef = collection(firestore, collectionName, ...contentsPath)

const useCMS = ()=>{
    const getContent = useCallback(async (contentId: string)=>{

        console.log("useCMS > getContent")
        
        const queryRef = query(cmsCollectionRef, where("contentId", "==", contentId))
        
        const docRefs = await getDocs(queryRef);

        if(docRefs.size == 0)
        {
            console.error("Found no items with contentId", contentId)
            return null;
        }

        if(docRefs.size > 1)
        {
            throw new Error("Found multiple items with the same contentId")
        }        

        const docRef = docRefs.docs[0];
        const docData: TDataStoreSchema = docRef.data() as TDataStoreSchema;        

        if(!docData)
        {   
            return null;
        }

        const response: TOutputSchema = {
            ...docData,
            contentId:docData.contentId,
            documentId: docRef.id
        }        

        return response;        
    },[])
    
    const addContent = useCallback(async (contentId: string, contentParams: TInputSchema)=>{
        console.log("useCMS > addContent")
        
        if(!auth.currentUser){
            throw new Error("You need to login inorder to perform this operation")
        }
        
        const docData = await getContent(contentId)

        if(docData)
        {            
            return docData;
        }

        const dataSchema: TDataStoreSchema = {
            ...contentParams,
            contentId:contentId,
            authUserId: auth.currentUser?.uid ?? "",
            createdOn: new Date(),
            updatedOn: new Date(),
            pageUrl: window.location.href
        }

        await addDoc(cmsCollectionRef, dataSchema)

        const docDataSchema = await getContent(contentId)
        
        if(!docDataSchema){
            console.error("Error loading data") 
            return null;
        }
        
        const newResponse: TOutputSchema = {
            ...docDataSchema
        }
      
        return newResponse
    },[getContent])

    const updateContent = useCallback(async (contentId: string, contentParams: TInputSchema)=>{
        console.log("useCMS > updateContent")

        if(!auth.currentUser){
            throw new Error("You need to login inorder to perform this operation")
        }

        const docData = await getContent(contentId)   

        if(!docData)
        {             
            const content = await addContent(contentId, contentParams);  

            return content;
        }

        const docRef = doc(firestore, collectionName, ...contentsPath, docData.documentId)
        
        const dataSchema: TDataStoreSchema = {
            ...docData,
            ...contentParams, 
            authUserId: auth.currentUser?.uid ?? "",   
            updatedOn: new Date(),
            pageUrl: window.location.href
        }

        await updateDoc(docRef, dataSchema)

        const updatedDocData = await getContent(contentId)     
        
        return updatedDocData;
    },[addContent, getContent])

    return { addContent, updateContent, getContent }
}

export default useCMS;