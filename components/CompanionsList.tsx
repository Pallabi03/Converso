// import React from 'react'
// import {
//     Table,
//     TableBody,
//     TableCaption,
//     TableCell,
//     TableHead,
//     TableHeader,
//     TableRow,
// } from "@/components/ui/table"
// import { cn, getSubjectColor } from '@/lib/utils';
// import Link from 'next/link';
// import Image from 'next/image';
// interface CompanionsListProps {
//     title: string;
//     companions?: Companion[];
//     classNames?: string;
// }

// const CompanionsList = ({ title, companions, classNames }: CompanionsListProps) => {
//     return (
//         <article className={cn('companion-list', classNames)}>
//             <h2 className="font-bold text-3xl">Recent sessions</h2>

//             <Table>
//                 <TableHeader>
//                     <TableRow>
//                         <TableHead className="text-lg w-2/3">Lessons</TableHead>
//                         <TableHead className='text-lg'>Subject</TableHead>
//                         <TableHead className='text-lg text-right'>Duration</TableHead>
//                     </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                     {companions?.map(({id,subject,name,topic,duration})=>(
//                         <TableRow key={id}>
//                             <TableCell>
//                                 <Link href={'/companions/${id}'}>
//                                 <div className="flex items-center gap-2">
//                                     <div className="size-[72px] flex items-center justify-center rounded-md max-md:hidden" style={{backgroundColor: getSubjectColor(subject)}}>
//                                         <Image src={`/icons/${subject}.svg`} alt={subject || "Companion icon"} width={35} height={35} />
//                                     </div>
//                                     <div className="flex flex-col gap-2">
//                                         <p className="font-bold text-2xl">{name}</p>
//                                         <p className="text-lg">{topic}</p>
//                                     </div>
//                                 </div>
//                                 </Link>
//                             </TableCell>
//                             <TableCell>
//                                 <div className="subject-badge w-fit max-md:hidden">
//                                     {subject}
//                                 </div>
//                                 <div className="flex items-center justify-center rounded-lg w-fit p-2 md:hidden" style={{backgroundColor: getSubjectColor(subject)}}>
//                                      <Image src={`/icons/${subject}.svg`} 
//                                         alt={subject || "Companion icon"} 
//                                         width={18} 
//                                         height={18} 
//                                      />       
//                                 </div>
//                             </TableCell>
//                             <TableCell>
//                                 <div className="flex items-center gap-2 w-full justify-end">

//                                     <p className="text-2xl">{duration}{' '}
//                                         <span className="max-md:hidden">mins</span>
//                                     </p>
//                                     <Image src="/icons/clock.svg" alt="minutes" width={14} height={14} className="md:hidden"/>
//                                 </div>
//                             </TableCell>
//                         </TableRow>
//                     ))}
                    
//                 </TableBody>
//             </Table>
//         </article>
//     )
// }

// export default CompanionsList



'use client'
import React from 'react'
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { cn, getSubjectColor } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import { removeBookmark } from '@/lib/actions/companion.action';
import { Trash2, X } from 'lucide-react'; // Import an icon

interface CompanionsListProps {
    title: string;
    companions?: Companion[];
    classNames?: string;
    showRemoveButton?: boolean; // Add this prop to conditionally show remove button
    currentPath?: string; // Path for revalidation
}

const CompanionsList = ({ title, companions, classNames, showRemoveButton = false, currentPath = "/" }: CompanionsListProps) => {
    
    const handleRemoveBookmark = async (companionId: string) => {
        try {
            await removeBookmark(companionId, currentPath);
        } catch (error) {
            console.error("Failed to remove bookmark:", error);
        }
    };

    return (
        <article className={cn('companion-list', classNames)}>
            <h2 className="font-bold text-3xl">Recent sessions</h2>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-lg w-2/3">Lessons</TableHead>
                        <TableHead className='text-lg'>Subject</TableHead>
                        <TableHead className='text-lg text-right'>Duration</TableHead>
                        {showRemoveButton && <TableHead className='text-lg text-right'>Action</TableHead>}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {companions?.map(({id, subject, name, topic, duration}) => (
                        <TableRow key={id}>
                            <TableCell>
                                <Link href={`/companions/${id}`}>
                                    <div className="flex items-center gap-2">
                                        <div className="size-[72px] flex items-center justify-center rounded-md max-md:hidden" style={{backgroundColor: getSubjectColor(subject)}}>
                                            <Image src={`/icons/${subject}.svg`} alt={subject || "Companion icon"} width={35} height={35} />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <p className="font-bold text-2xl">{name}</p>
                                            <p className="text-lg">{topic}</p>
                                        </div>
                                    </div>
                                </Link>
                            </TableCell>
                            <TableCell>
                                <div className="subject-badge w-fit max-md:hidden">
                                    {subject}
                                </div>
                                <div className="flex items-center justify-center rounded-lg w-fit p-2 md:hidden" style={{backgroundColor: getSubjectColor(subject)}}>
                                     <Image src={`/icons/${subject}.svg`} 
                                        alt={subject || "Companion icon"} 
                                        width={18} 
                                        height={18} 
                                     />       
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2 w-full justify-end">
                                    <p className="text-2xl">{duration}{' '}
                                        <span className="max-md:hidden">mins</span>
                                    </p>
                                    <Image src="/icons/clock.svg" alt="minutes" width={14} height={14} className="md:hidden"/>
                                </div>
                            </TableCell>
                            {showRemoveButton && (
                                <TableCell>
                                    <form action={() => handleRemoveBookmark(id)}>
                                        <button 
                                            type="submit"
                                            className="text-red-500 hover:text-red-700 p-2"
                                            aria-label="Remove bookmark"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </form>
                                </TableCell>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </article>
    )
}

export default CompanionsList