import * as React from 'react';
import {
    Typography,
    Card,
    CardContent,
    CardActions,
    Button,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import HomeIcon from '@material-ui/icons/Home';
import CodeIcon from '@material-ui/icons/Code';

const useStyles = makeStyles(theme => ({
    root: {
        background: `#c5dedd`,
        color: 'rgba(0, 0, 0, 0.87)',
        padding: '1em',
        marginBottom: '1em',
        marginTop: '2em',
    },
    actions: {
        padding: theme.spacing(2),
        marginTop: -theme.spacing(2),
        marginBottom: -theme.spacing(1),
        flexDirection: 'column',
        '& a': {
            marginBottom: theme.spacing(1),
            backgroundColor: 'white',
            marginLeft: '0 !important',
        },
    },
}));

export const Welcome = () => {
    const classes = useStyles();
    return (
        <Card className={classes.root}>
            <CardContent>
                <Typography variant="h5" gutterBottom>
                 cust-rel-mngt
                </Typography>
                <Typography gutterBottom>
                 Uses API
                </Typography>
                <Typography gutterBottom>
                </Typography>
            </CardContent>
            <CardActions className={classes.actions}>
                <Button
                    variant="contained"
                    fullWidth
                    href="https://marmelab.com/react-admin"
                    startIcon={<HomeIcon />}
                >
                    React-admin site
                </Button>
                <Button
                    variant="contained"
                    fullWidth
                    href="https://github.com/fswebdev/custrelmngt"
                    startIcon={<CodeIcon />}
                >
                    Source for this demo
                </Button>
            </CardActions>
        </Card>
    );
};
