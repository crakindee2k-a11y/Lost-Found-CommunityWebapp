import React from 'react';
import './Stories.css';

const Stories = () => {
    const stories = [
        {
            id: 1,
            icon: '📱',
            title: 'iPhone Found at Central Park',
            story: 'Sarah lost her iPhone during her morning jog. Within 2 hours, someone posted it on FindX. She got it back the same day!',
            author: 'Sarah M.',
            date: 'March 15, 2024'
        },
        {
            id: 2,
            icon: '🐕',
            title: 'Max the Golden Retriever',
            story: 'Our family dog went missing for 3 days. A kind stranger found him and posted on FindX. We were reunited thanks to this amazing community!',
            author: 'Mike R.',
            date: 'February 28, 2024'
        },
        {
            id: 3,
            icon: '💼',
            title: 'Business Documents Recovered',
            story: 'I left my briefcase with crucial client documents at a coffee shop. Someone found it and posted here. My presentation was saved!',
            author: 'James K.',
            date: 'March 5, 2024'
        },
        {
            id: 4,
            icon: '💍',
            title: "Grandmother's Wedding Ring",
            story: "Lost my grandmother's precious wedding ring at the beach. Almost gave up hope, but FindX connected me with the person who found it. Priceless!",
            author: 'David C.',
            date: 'January 20, 2024'
        },
        {
            id: 5,
            icon: '🎒',
            title: 'Student Backpack with All IDs',
            story: 'Lost my backpack with wallet, student ID, and laptop. Found it posted on FindX within an hour. Faith in humanity restored!',
            author: 'Lisa P.',
            date: 'March 10, 2024'
        },
        {
            id: 6,
            icon: '🔑',
            title: 'Car Keys at the Mall',
            story: 'Dropped my car keys somewhere at the mall. Panicked for hours until I checked FindX and someone had already posted them!',
            author: 'Emma L.',
            date: 'February 15, 2024'
        }
    ];

    return (
        <div className="stories-page">
            <div className="stories-header">
                <h1>Success Stories</h1>
                <p className="stories-subtitle">Real people, real reunions. See how FindX has helped our community.</p>
            </div>

            <div className="stories-grid">
                {stories.map((story, index) => (
                    <div key={story.id} className="story-card-full" style={{animationDelay: `${index * 0.1}s`}}>
                        <div className="story-icon-large">{story.icon}</div>
                        <h3 className="story-title">{story.title}</h3>
                        <p className="story-content">"{story.story}"</p>
                        <div className="story-footer">
                            <span className="story-author">— {story.author}</span>
                            <span className="story-date">{story.date}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Stories;


