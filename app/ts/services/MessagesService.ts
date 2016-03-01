
import {Injectable, bind} from 'angular2/core';
import {Subject, Observable} from 'rxjs';
import {User, Thread, Message} from '../models';

let initialMessages: Message[] = [];

interface IMessagesOperation extends Function {
    (messages: Message[]): Message[];
}

@Injectable()
export class MessagesService {
    // a stream that publishes new messages only once
    newMessages: Subject<Message> = new Subject<Message>();

    addMessage(message: Message): void {
        this.newMessages.next(message);
    }

    messagesForThreadUser(thread: Thread, user: User): Observable<Message> {
        return this.newMessages
            .filter((message: Message) => {
                // belongs to this thread and isn't autohored by this user
                return (message.thread.id === thread.id) && (message.author.id !== user.id);
            });
    }

    // 'messages' is a stream that emits an array of the most recent messages
    messages: Observable<Message[]>

    // `updates` receives _operations_ to be applied to our `messages`
    // This is a way we can perform changes on *all* messages (that are currently stored in `messages`)
    updates: Subject<any> = new Subject<any>();

    // action streams
    create: Subject<Message> = new Subject<Message>();
    markThreadAsRead: Subject<any> = new Subject<any>();

    constructor() {
        this.messages = this.updates
            // watch the updates and accumulate operations on the messages
            .scan((messages: Message[], operation: IMessagesOperation) => {
                return operation(messages);
            },
            initialMessages)
        // make sure we can share the most recent list of messages across anyone who is
        // interested in subscribing and cache the last known list of messages
        .publishReplay(1)
        .refCount();

        // `create` takes a Message and then puts an operation on the `updates` stream
        // to add the Message to the list of messages. That is, for each item that gets added
        // to `create` this stream emits a concat operation function.

        // Next, we subscribe `this.updates` to listen to this stream, which means that it will
        // received each operation that is created.

        this.create.map( function(message: Message): IMessagesOperation {
            return (messages: Message[]) => {
              return messages.concat(message);
            };
        }).subscribe(this.updates);

        this.newMessages.subscribe(this.create);

        // similarly, `markThreadAsRead` takes a Thread and then puts an operation on the `updates` stream

        this.markThreadAsRead
            .map( (thread: Thread) => {
                return (messages: Message[]) => {
                    return messages.map( (message: Message) => {
                        // note that we're manipulating `message` directly here
                        if (message.thread.id === thread.id) {
                            message.isRead = true;
                        }
                        return message;
                    });
                };
            })
            .subscribe(this.updates);

    }

    // an imperative function call to this action stream
    addMessage(message: Message): void {
        this.newMessages.next(message);
    }
}

export var messagesServiceInjectables: Array<any> = [
  bind(MessagesService).toClass(MessagesService)
];
