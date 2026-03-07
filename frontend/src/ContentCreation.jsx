import React from 'react';

function ContentCreation() {
    const [formData, setFormData] = React.useState({
        name: '',
        group_name: '',
        tags: [],
        md_notes: '',
        image_ids: [],
        article_links: [],
        video_links: [],
        lookup_id: ''
    });

    const [tagInput, setTagInput] = React.useState('');
    const [referenceInput, setReferenceInput] = React.useState('');
    const [referenceType, setReferenceType] = React.useState('article');
    const [uploadedFiles, setUploadedFiles] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState('');

    const API_BASE = 'http://localhost:8000';

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            setUploadedFiles(Array.from(files));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleAddTag = () => {
        if (tagInput.trim()) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tagInput.trim()]
            }));
            setTagInput('');
        }
    };

    const handleRemoveTag = (index) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter((_, i) => i !== index)
        }));
    };

    const handleAddReference = () => {
        if (referenceInput.trim()) {
            const linkArray = referenceType === 'article' ? 'article_links' : 'video_links';
            setFormData(prev => ({
                ...prev,
                [linkArray]: [...prev[linkArray], referenceInput.trim()]
            }));
            setReferenceInput('');
        }
    };

    const handleRemoveReference = (index, type) => {
        const linkArray = type === 'article' ? 'article_links' : 'video_links';
        setFormData(prev => ({
            ...prev,
            [linkArray]: prev[linkArray].filter((_, i) => i !== index)
        }));
    };

    const uploadImages = async () => {
        if (uploadedFiles.length === 0) {
            return [];
        }

        const imageIds = [];
        for (const file of uploadedFiles) {
            try {
                const formDataFile = new FormData();
                formDataFile.append('file', file);

                const response = await fetch(`${API_BASE}/upload-image`, {
                    method: 'POST',
                    body: formDataFile
                });

                if (!response.ok) {
                    throw new Error(`Failed to upload image: ${file.name}`);
                }

                const data = await response.json();
                imageIds.push(data.image_id);
            } catch (err) {
                setError(`Error uploading file ${file.name}: ${err.message}`);
                throw err;
            }
        }

        return imageIds;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Step 1: Upload images and get their IDs
            const imageIds = await uploadImages();

            // Step 2: Create content item with image IDs
            const contentData = {
                name: formData.name,
                lookup_id: formData.lookup_id,
                group_name: formData.group_name,
                tags: formData.tags,
                md_notes: formData.md_notes,
                article_links: formData.article_links,
                video_links: formData.video_links,
                image_ids: imageIds
            };

            const response = await fetch(`${API_BASE}/data`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(contentData)
            });

            if (!response.ok) {
                throw new Error('Failed to save content item');
            }

            // Reset form on success
            setFormData({
                name: '',
                group_name: '',
                tags: [],
                md_notes: '',
                image_ids: [],
                article_links: [],
                video_links: [],
                lookup_id: ''
            });
            setUploadedFiles([]);
            setError('');
            alert('Content item saved successfully!');
        } catch (err) {
            setError(`Error: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

            <div>
                <label htmlFor="name">Name</label>
                <input 
                    type="text" 
                    placeholder="Name" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange}
                    required
                />
            </div>

            <div>
                <label htmlFor="lookup_id">Lookup ID</label>
                <input 
                    type="text" 
                    placeholder="Lookup ID" 
                    name="lookup_id" 
                    value={formData.lookup_id} 
                    onChange={handleChange}
                    required
                />
            </div>

            <div>
                <label htmlFor="group_name">Group Name</label>
                <input 
                    type="text" 
                    placeholder="Group Name" 
                    name="group_name" 
                    value={formData.group_name} 
                    onChange={handleChange}
                    required
                />
            </div>

            <div>
                <label htmlFor="tags">Tags</label>
                <div style={{ display: 'flex', gap: '5px' }}>
                    <input 
                        type="text" 
                        placeholder="Add tag" 
                        value={tagInput} 
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    />
                    <button type="button" onClick={handleAddTag}>+</button>
                </div>
                <div className="tags" style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {formData.tags.map((tag, index) => (
                        <span 
                            key={index} 
                            style={{ 
                                backgroundColor: '#e0e0e0', 
                                padding: '5px 10px', 
                                borderRadius: '5px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                            }}
                        >
                            {tag}
                            <button 
                                type="button" 
                                onClick={() => handleRemoveTag(index)}
                                style={{ cursor: 'pointer', border: 'none', background: 'none', color: 'red' }}
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            </div>

            <div>
                <label htmlFor="md_notes">Markdown Content</label>
                <textarea 
                    placeholder="Markdown Content" 
                    name="md_notes" 
                    value={formData.md_notes} 
                    onChange={handleChange}
                    rows="8"
                />
            </div>

            <div>
                <label htmlFor="image">Media Upload</label>
                <input 
                    type="file" 
                    name="image" 
                    onChange={handleChange}
                    multiple
                    accept="image/*"
                />
                {uploadedFiles.length > 0 && (
                    <div style={{ marginTop: '10px' }}>
                        <p>Files to upload: {uploadedFiles.length}</p>
                        <ul>
                            {Array.from(uploadedFiles).map((file, index) => (
                                <li key={index}>{file.name}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <div>
                <label>References</label>
                <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
                    <select 
                        value={referenceType} 
                        onChange={(e) => setReferenceType(e.target.value)}
                    >
                        <option value="article">Article Link</option>
                        <option value="video">Video Link</option>
                    </select>
                    <input 
                        type="url" 
                        placeholder="Add reference URL" 
                        value={referenceInput} 
                        onChange={(e) => setReferenceInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddReference())}
                    />
                    <button type="button" onClick={handleAddReference}>+</button>
                </div>

                <div className="links">
                    {formData.article_links.length > 0 && (
                        <div>
                            <h4>Article Links</h4>
                            <ul>
                                {formData.article_links.map((link, index) => (
                                    <li key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <a href={link} target="_blank" rel="noopener noreferrer">{link}</a>
                                        <button 
                                            type="button" 
                                            onClick={() => handleRemoveReference(index, 'article')}
                                            style={{ cursor: 'pointer', border: 'none', background: 'none', color: 'red' }}
                                        >
                                            ×
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {formData.video_links.length > 0 && (
                        <div>
                            <h4>Video Links</h4>
                            <ul>
                                {formData.video_links.map((link, index) => (
                                    <li key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <a href={link} target="_blank" rel="noopener noreferrer">{link}</a>
                                        <button 
                                            type="button" 
                                            onClick={() => handleRemoveReference(index, 'video')}
                                            style={{ cursor: 'pointer', border: 'none', background: 'none', color: 'red' }}
                                        >
                                            ×
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            <button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Content Item'}
            </button>
        </form>
    );
}  

export default ContentCreation;

// https://res.cloudinary.com/dkek5ojrc/image/upload/v1772898344/knowledge_base_images/hpd1vmls3syb7zfpvsn0