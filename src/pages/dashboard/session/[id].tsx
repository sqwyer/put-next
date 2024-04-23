import { useSession } from "next-auth/react";
import { redirect } from 'next/navigation';
import Head from "next/head";
import { useRouter } from "next/router";
import { ChangeEvent, HTMLProps, useLayoutEffect, useState } from "react";
import { Input } from "~/components/Input";
import { Nav } from "~/components/Nav";
import { api } from "~/utils/api";
import { isAdmin } from "~/utils/isAdmin";
import Link from "next/link";
import { CheckboxInput } from "~/components/CheckboxInput";
import { TutoringSession } from "@prisma/client";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export default function SessionEditor() {
    const router = useRouter()

    const {data: userSession, status: userStatus} = useSession();
    const {data: session, status} = api.session.find.useQuery({id: router.query.id as string});

    useLayoutEffect(() => {
        if(userStatus == "unauthenticated") redirect("/")
        if(userStatus == "authenticated") {
            if(!isAdmin(userSession.user.email)) redirect("/")
        }
    }, [])

    return <>
        <Head>
            <title>PB Tutoring</title>
            <meta name="description" content="Generated by create-t3-app" />
            <link rel="icon" type="image/svg+xml" href="/public/favicon.svg" />
        </Head>
        <main className="bg-blue-800 min-h-screen relative flex flex-col gap-0 justify-between">
            <div>
                <Nav />
                <div className="flex flex-col py-16 px-8 sm:p-16 xl:px-32 2xl:p-32 gap-8">
                {status === "pending" && <p className="text-white">Loading...</p>}
                {status === "error" && <div className="text-white flex flex-col gap-2">
                    <p>Couldn&apos;t load session...</p>
                    <Link href="/dashboard" className="underline cursor-pointer text-white">Back to dashboard</Link>
                </div>}
                {status === "success" && 
                    <div className="bg-blue-900 p-4 rounded-lg flex flex-col gap-4">
                        <div>
                            <p className="text-white font-semibold text-lg">Currently editing session &quot;{session?.label}&quot;</p>
                            <p className="text-white text-xs">({session?.id})</p>
                        </div>
                        <SessionForm session={session as TutoringSession} />
                    </div>}
                </div>
            </div>
        </main>
    </>
}

interface SessionFormProps extends HTMLProps<HTMLDivElement> {
    session: TutoringSession
}

function SessionForm({session}: SessionFormProps) {
    const d = new Date()
    const month = months[d.getMonth()]

    const [label, setLabel] = useState(session.label)
    const [location, setLocation] = useState(session.location)
    const [date, setDate] = useState(session.date)
    const [time, setTime] = useState(session.time)
    const [booked, setBooked] = useState(session.booked as boolean)

    const updateMutation = api.session.update.useMutation()

    const updateSession = (id: string) => {
        updateMutation.mutate({
            id,
            data: {
                label,
                location,
                date,
                time,
                booked
            }
        });
        window.open('/dashboard', '_self')
    }

    return <div className="flex flex-col gap-2">
        <input className="bg-white text-white bg-opacity-5 border-white border border-opacity-15 p-2 rounded-md focus:outline-none focus:border-opacity-25 focus:bg-opacity-10" placeholder="Label (Math Tutoring - One on One)" value={label} onChange={(event: ChangeEvent<HTMLInputElement>) => setLabel(event.target.value)} />
        <input className="bg-white text-white bg-opacity-5 border-white border border-opacity-15 p-2 rounded-md focus:outline-none focus:border-opacity-25 focus:bg-opacity-10" placeholder="Location (2801 Orange St NLR)" value={location} onChange={(event: ChangeEvent<HTMLInputElement>) => setLocation(event.target.value)} />
        <input className="bg-white text-white bg-opacity-5 border-white border border-opacity-15 p-2 rounded-md focus:outline-none focus:border-opacity-25 focus:bg-opacity-10" placeholder={`Date (${month} ${d.getDate()})`} value={date} onChange={(event: ChangeEvent<HTMLInputElement>) => setDate(event.target.value)} />
        <input className="bg-white text-white bg-opacity-5 border-white border border-opacity-15 p-2 rounded-md focus:outline-none focus:border-opacity-25 focus:bg-opacity-10" placeholder="Time (5-7:00pm)" value={time} onChange={(event: ChangeEvent<HTMLInputElement>) => setTime(event.target.value)} />
        <div className="flex flex-row gap-2">
            <p className="text-white">Booked</p>
            <CheckboxInput checked={booked} onChange={(event: ChangeEvent<HTMLInputElement>) => setBooked(event.target.checked)} />
        </div>
        <button className="bg-red-600 text-white cursor-pointer rounded-lg font-semibold px-4 py-2" onClick={() => updateSession(session?.id as string)}>Update Session</button>
        <p className="text-red-400 underline text-sm cursor-pointer">Delete this session (you cannot undo this action)</p>
    </div>
}