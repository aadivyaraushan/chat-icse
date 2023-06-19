import Image from 'next/image'
import { Inter } from 'next/font/google'
import TopBar from "../components/TopBar";
import Message from "../components/Message";
import MessageForm from "../components/MessageForm";
import {sendMessage} from "../langchain";

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  // components:
  // 1. message component -> done
  // 2. message form component
  // 3. background for messages (put that here)
  // 4. sidebar for previous conversations (maybe)
  // 5. top bar (to store school logo (later), app name, account (later))

  return (
      <div>
        <TopBar />
        <Message isBot={true}>Hello</Message>
        <Message isBot={true}>I'm ChatICSE</Message>
        <Message isBot={true}>I do ICSE stuff. Hopefully gonna make it less torturous for you. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam commodo congue est, dignissim bibendum metus congue ac. Praesent mollis augue condimentum nisl eleifend suscipit. Maecenas porttitor arcu odio. Vestibulum convallis ex at varius laoreet. Proin ultrices diam non urna euismod, in scelerisque ligula rutrum. Sed eget commodo odio. Pellentesque feugiat, nunc at auctor vehicula, lectus risus mattis risus, vitae commodo lorem massa ac ligula. Mauris sit amet dignissim est. Nunc vitae suscipit nisl. Aliquam eget elit eu felis convallis aliquet sed ut nunc.</Message>
        <Message isBot={false}>Ok how tho</Message>
        <MessageForm onClickMessageForm={sendMessage} />
      </div>
  )
}
