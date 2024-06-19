module.exports = {
    name: 'playerError',
    execute(error) {
        console.error('Music Player encountered unexpected error:')
        console.error(error);
    }
}