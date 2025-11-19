import { asDate } from '@prismicio/client';
import { createClient } from '$lib/prismicio';

export async function load({ fetch, cookies }) {
    const client = createClient({ fetch, cookies });
    
    const page = await client.getSingle('home');
    const speakers = await client.getAllByType('speakers');
    const sponsors = await client.getAllByType('sponsors');
    const talks = await client.getAllByType('talk');
    const sessions = await client.getAllByType('sessions');
    
    const sortedSpeakers = speakers.sort((a, b) => {
        const nameA = a.data.name?.toLowerCase() || '';
        const nameB = b.data.name?.toLowerCase() || '';
        return nameA.localeCompare(nameB);
    });
    
    // Assign talks to sessions based on timestamps
    const sessionsWithTalks = sessions.map(session => {
        const sessionStart = asDate(session.data.start);
        const sessionEnd = asDate(session.data.end);
        
        // Skip assignment if session times are invalid
        if (!sessionStart || !sessionEnd) {
            return {
                ...session,
                talks: []
            };
        }
        
        const assignedTalks = talks.filter(talk => {
            const talkTime = asDate(talk.data.start_time);
            
            // Skip if talk time is invalid
            if (!talkTime) return false;
            
            return talkTime >= sessionStart && talkTime <= sessionEnd;
        }).sort((a, b) => {
            const timeA = asDate(a.data.start_time);
            const timeB = asDate(b.data.start_time);
            
            // Handle null cases in sort
            if (!timeA && !timeB) return 0;
            if (!timeA) return 1;
            if (!timeB) return -1;
            
            return timeA.getTime() - timeB.getTime();
        });
        
        return {
            ...session,
            talks: assignedTalks
        };
    }).sort((a, b) => {
        const startA = asDate(a.data.start);
        const startB = asDate(b.data.start);
        
        // Handle null cases in sort
        if (!startA && !startB) return 0;
        if (!startA) return 1;
        if (!startB) return -1;
        
        return startA.getTime() - startB.getTime();
    });
    
    return {
        page,
        speakers: sortedSpeakers,
        sponsors,
        talks,
        sessions: sessionsWithTalks,
        title: page.data.meta_title,
        meta_description: page.data.meta_description,
        meta_title: page.data.meta_title,
        meta_image: page.data.meta_image.url
    };
}

export function entries() {
    return [{}];
}