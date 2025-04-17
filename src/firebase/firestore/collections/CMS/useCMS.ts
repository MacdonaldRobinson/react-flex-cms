import { collection, addDoc, updateDoc, doc, query, where, getDocs, orderBy, Timestamp } from "firebase/firestore";
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

export type TContentHistory = {
    items: TOutputSchema[]
}

const collectionName = "CMS"
const contentsPath: string[] = [window.location.hostname, "contents"]

const cmsCollectionRef = collection(firestore, collectionName, ...contentsPath)

const useCMS = ()=>{
    const toDateSafe = (input: Date | Timestamp | null | undefined): Date | null => {
        if (!input) return null;
      
        // Firestore Timestamp has a .toDate() method
        if (typeof input === "object" && "toDate" in input && typeof input.toDate === "function") {
          return input.toDate();
        }
      
        // Already a Date object
        if (input instanceof Date) {
          return input;
        }
      
        return null; // fallback for unexpected types
      }

    const getContentHistory = useCallback(async (contentId: string): Promise<TContentHistory | null>=>{

        console.log("useCMS > getContent")
        
        const queryRef = query(
            cmsCollectionRef, 
            where("contentId", "==", contentId), 
            orderBy("createdOn", "desc")
        )
        
        const docRefs = await getDocs(queryRef);

        if(docRefs.empty){
            console.warn("No documents found for contentId: ", contentId)
            return null
        }

        const contentHistory = docRefs.docs.map((docRef)=>{
            const docData: TDataStoreSchema = docRef.data() as TDataStoreSchema;        
            const outputSchema: TOutputSchema = {
                ...docData,
                documentId: docRef.id,
                createdOn: toDateSafe(docData.createdOn)!,
                updatedOn: toDateSafe(docData.updatedOn)!

            }
            return outputSchema;            
        })

        const newContentHistory:TContentHistory = {
            items: contentHistory
        }

        return newContentHistory;        
    },[])
    
    const addContent = useCallback(async (contentId: string, contentParams: TInputSchema): Promise<TContentHistory | null>=>{
        console.log("useCMS > addContent")
        
        if(!auth.currentUser){
            throw new Error("You need to login inorder to perform this operation")
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

        const contentHistory = await getContentHistory(contentId)
        
        if(!contentHistory){
            console.error("Error loading data") 
            return null;
        }

        return contentHistory
    },[getContentHistory])

    return { addContent, getContentHistory }
}

export default useCMS;