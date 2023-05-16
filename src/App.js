
import { Box, Button, Container, VStack, Input, HStack } from "@chakra-ui/react"
import { useEffect, useRef, useState } from "react";
import {app} from './firebase'
import Message from "./Components/Message";


import { onAuthStateChanged, getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'
import { getFirestore, addDoc, collection, serverTimestamp, onSnapshot, query, orderBy} from 'firebase/firestore';


const auth = getAuth();
const db = getFirestore(app);


//function for login using firebase
const loginHandler = () => {
  const provider = new GoogleAuthProvider()
  signInWithPopup(auth, provider);
}
//function for logout
const logoutHandler = () => signOut(auth);



function App() {
  const [user, setUser] = useState(false);
  const [message, setMessage] = useState("");
   //array for getting messages form firebase
  const [messages, setMessages] = useState([]);
  
  const divForScroll = useRef(null);
  const submitHandler = async(e) => {
  e.preventDefault();
    try {
      setMessage("");
    await addDoc(collection(db, "Messages"), {
      text: message,
      uid: user.uid,
      uri: user.photoURL,
      createdAt:serverTimestamp(),
    });
    //send dabate hi input field empty ho jana chahiye
  
    divForScroll.current.scrollIntoView({behavior:"smooth"});
  } catch (err) {
    alert(err);
  }

}



  useEffect(() => {
   const unsubscribe=onAuthStateChanged(auth, (data) => {
      setUser(data);
   });
   const q = query(collection(db, "Messages"), orderBy("createdAt", "asc"));
   const unsubscribeForMessages= onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((item) => {
        const id = item.id;
        return {id, ...item.data()}
      }));
    })
    return () => {
      unsubscribe();
      unsubscribeForMessages();
    };
  },[])
  


  return (
    <Box bg={"red.50"}>
     { 
      user?( <Container h={"100vh"} bg={"white"}>
        {/* vertical stack jiski display flex hai */}
        <VStack h={"full"} paddingY={'4'}>
          <Button w={"full"} colorScheme={"red"} onClick={logoutHandler} >logout</Button>
          <VStack h={"full"} w={"full"} overflowY={'auto'}  css={{
                "&::-webkit-scrollbar": {
                  display: "none",
                },
              }}>
              {
                messages.map(item => (
                  <Message
                    text={item.text}
                    uri={item.uri}
                    user={user.uid === item.uid ? 'me' : 'other'}
                    key={item.id}
                  />
                ))
            }
          <div ref={divForScroll}></div>
          </VStack>
          <form onSubmit={submitHandler} style={{ width: "100%" }}>
            <HStack>
            <Input value={message} onChange={(e)=>{setMessage(e.target.value)}} placeholder="Enter Your message"/>
            <Button type="submit" colorScheme={"purple"}>Send</Button>
            </HStack>
          </form>
        </VStack>
        </Container>) :
          (<VStack h={'100vh'} bg={'white'} justifyContent={"center"} >
            <Button colorScheme="purple" onClick={loginHandler}>Sign with google</Button>
          </VStack>)
     }
   </Box>
  );
}

export default App;
