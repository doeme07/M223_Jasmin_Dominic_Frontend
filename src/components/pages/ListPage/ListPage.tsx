import {useState, useEffect, useContext} from 'react';
import {Box} from '@mui/system';
import Navbar from "../../../Router/Navbar";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import {Button, TextField, IconButton, CardActions} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import {ListEntry} from '../../../types/models/ListEntry.model';
import ListService from '../../../Services/ListService';
import SaveButton from "../../atoms/SaveButton";
import ActiveUserContext from "../../../Contexts/ActiveUserContext";

const ListPage: React.FC = () => {
    const initialListEntries: ListEntry[] = [];
    const [listEntries, setListEntries] = useState<ListEntry[]>(initialListEntries);
    const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editIndex, setEditIndex] = useState<number>(-1);
    const [newEntry, setNewEntry] = useState<ListEntry>({
        title: "",
        text: "",
        importance: 0,
        user: {
            id: ""
        }
    });
    const [filterValue, setFilterValue] = useState<number | null>(null); // State for the filter value

    // Access the ActiveUserContext
    const {user} = useContext(ActiveUserContext);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setNewEntry(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async () => {
        try {
            // Validation for title (2 to 5 characters)
            if (newEntry.title.length < 2 || newEntry.title.length > 5) {
                alert('Title must be between 2 and 5 characters.');
                return;
            }

            // Validation for text (5 to 100 characters)
            if (newEntry.text.length < 5 || newEntry.text.length > 100) {
                alert('Text must be between 5 and 100 characters.');
                return;
            }

            // Validation for importance (1 to 5)
            if (newEntry.importance < 1 || newEntry.importance > 5) {
                alert('Importance must be between 1 and 5.');
                return;
            }

            // Proceed with submitting the form if validation passes
            const currentDate = new Date().toISOString().split('T')[0];
            const updatedEntry = {...newEntry, creationDate: currentDate, user: {id: user?.id || ''}};
            if (isEditing) {
                const editedEntries = [...listEntries];
                editedEntries[editIndex] = updatedEntry;
                await ListService.updateListEntry(updatedEntry);
                setListEntries(editedEntries);
                setIsEditing(false);
            } else {
                const createdEntry = await ListService.addListEntry(updatedEntry);
                setListEntries(prevState => [...prevState, createdEntry]);
            }
            setNewEntry({
                title: "",
                text: "",
                importance: 0,
                user: {
                    id: ""
                }
            });
            setShowCreateForm(false);
        } catch (error) {

            alert('Failed to add list entry. Please try again.');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const entryToDelete = listEntries.find(entry => entry.id === id);
            if (!entryToDelete) {
                return;
            }
            // Check if the user owns the entry before deleting

            await ListService.deleteListEntry(id);
            // Remove the deleted entry from the state
            setListEntries(prevState => prevState.filter(entry => entry.id !== id));
        } catch (error) {

        }
    };


    const handleEdit = (index: number) => {
        setNewEntry(listEntries[index]); // Set form fields to the data of the entry being edited
        setIsEditing(true);
        setEditIndex(index);
        setShowCreateForm(true);
    };

    const handleCancel = () => {
        setNewEntry({
            title: "",
            text: "",
            importance: 0,
            user: {
                id: ""
            }
        });
        setShowCreateForm(false);
        setIsEditing(false);
    };

    // Filter list entries based on the selected importance
    const filteredListEntries = filterValue !== null ? listEntries.filter(entry => entry.importance === filterValue) : listEntries;

    // Sort list entries by importance in ascending order
    const sortAscending = () => {
        const sortedEntries = [...listEntries].sort((a, b) => a.importance - b.importance);
        setListEntries(sortedEntries);
    };

    // Sort list entries by importance in descending order
    const sortDescending = () => {
        const sortedEntries = [...listEntries].sort((a, b) => b.importance - a.importance);
        setListEntries(sortedEntries);
    };

    useEffect(() => {
        const fetchListEntries = async () => {
            try {
                const entries = await ListService.getAllListEntries();
                setListEntries(entries);
            } catch (error) {

            }
        };
        fetchListEntries();
    }, []);

    return (
        <>
            <Navbar/>
            <Box sx={{textAlign: 'center'}}>
                <h1>Lists</h1>
                <IconButton
                    data-cy="List-create-button"
                    onClick={() => {
                        setShowCreateForm(true);
                        setIsEditing(false); // Reset editing state when creating new entry
                    }}
                    color="primary"
                >
                    <AddIcon/>
                </IconButton>
                <Box>
                    <Button
                        data-cy="List-sort-ascending-button"
                        onClick={() => sortAscending()} // Sort by importance in ascending order
                    >
                        Sort Ascending
                    </Button>
                    <Button
                        data-cy="List-sort-descending-button"
                        onClick={() => sortDescending()} // Sort by importance in descending order
                    >
                        Sort Descending
                    </Button>
                </Box>
                {showCreateForm && (
                    <Box sx={{display: 'flex', justifyContent: 'center', marginTop: '20px'}}>
                        <Card style={{padding: 20, width: 400}}>
                            <CardContent>
                                <TextField
                                    data-cy="List-title-field"
                                    id="title"
                                    name="title"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    placeholder="Title"
                                    value={newEntry.title}
                                    onChange={handleChange}
                                />
                                <TextField
                                    data-cy="List-text-field"
                                    id="text"
                                    name="text"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    placeholder="Text"
                                    value={newEntry.text}
                                    onChange={handleChange}
                                />
                                <TextField
                                    data-cy="List-number-field"
                                    id="importance"
                                    name="importance"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    type="number"
                                    placeholder="Importance (1-5)"
                                    value={newEntry.importance.toString()}
                                    onChange={handleChange}
                                    inputProps={{min: "1", max: "5"}}
                                />
                                <CardActions sx={{justifyContent: 'center'}}>
                                    <SaveButton
                                        data-cy="List-save-button"
                                        variant="contained"
                                        color="primary"
                                        onClick={handleSubmit}
                                    >
                                        Save
                                    </SaveButton>
                                    <Button
                                        data-cy="List-cancel-button"
                                        variant='contained'
                                        color='error'
                                        onClick={handleCancel}
                                    >
                                        Cancel
                                    </Button>
                                </CardActions>

                            </CardContent>
                        </Card>
                    </Box>
                )}

                <Box sx={{display: 'flex', justifyContent: 'center', marginTop: '20px'}}>
                    {filteredListEntries.length > 0 ? (
                        <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                            {filteredListEntries.map((entry, index) => (
                                <Card key={index} style={{padding: 20, width: 320, margin: '10px auto'}}>
                                    <CardContent>
                                        <Typography variant="body1" component="div">
                                            <strong>Title:</strong> {entry.title}
                                        </Typography>
                                        <Typography variant="body1" component="div">
                                            <strong>Text:</strong> {entry.text}
                                        </Typography>
                                        <Typography variant="body1" component="div">
                                            <strong>Importance:</strong> {entry.importance}
                                        </Typography>
                                    </CardContent>
                                    <CardActions sx={{justifyContent: 'center'}}>
                                        <Button
                                            data-cy="List-edit-button"
                                            size='small'
                                            color='primary'
                                            variant='contained'
                                            onClick={() => handleEdit(index)} // Pass index to identify which entry is being edited
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            data-cy="List-delete-button"
                                            size='small'
                                            color='error'
                                            variant='contained'
                                            onClick={() => entry.id && handleDelete(entry.id)} // Pass entry id to identify which entry to delete
                                        >
                                            Delete
                                        </Button>
                                    </CardActions>
                                </Card>
                            ))}
                        </Box>
                    ) : (
                        <Typography variant="body1">No entries available</Typography>
                    )}
                </Box>
            </Box>
        </>
    );
}

export default ListPage;
