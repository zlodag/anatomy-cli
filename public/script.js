

$(function() {
    var config = {
        apiKey: "AIzaSyCNC0Rl6WPNd1qzTpyVchkyImJc1Fy4T54",
        authDomain: "ranzcr-anatomy.firebaseapp.com",
        databaseURL: "https://ranzcr-anatomy.firebaseio.com",
        projectId: "ranzcr-anatomy",
        storageBucket: "ranzcr-anatomy.appspot.com",
        messagingSenderId: "51391304946"
    };
    firebase.initializeApp(config);
    var db = firebase.firestore();
    // var db = firebase.database();
    
    var terminal = $('#terminal').terminal([
        {
            help: function(){
                this.echo('[[ub;;]Usage]');
                this.echo('"regions" : list all regions');
                this.echo('"all" : list all items');
                this.echo('"items" : list items filtered by region');
                this.echo('"add" : add new regions or items');
                this.echo('"help" : display this message');
            },
            regions: function(){
                this.pause();
                this.echo('Retrieving all regions...');
                db.collection("regions").orderBy('name').get().then(listDocuments);
            },
            all: function(){
                this.pause();
                this.echo('Retrieving all items...');
                db.collection("items").orderBy('name').get().then(listDocuments);
            },
            items: function(){
                this.pause();
                this.echo('List items by region (retrieving regions)...');
                db.collection("regions").orderBy('name').get().then(querySnapshot => {
                    if (querySnapshot.empty){
                        this.echo('No regions exist!');
                    } else {
                        var prompt = '';
                        for (var i = 0; i < querySnapshot.size; i++) {
                            var queryDocumentSnapshot = querySnapshot.docs[i];
                            prompt += `${i + 1}: ${queryDocumentSnapshot.get('name')}\n`;
                        }
                        prompt += `Select a region (Enter a number between 1 and ${querySnapshot.size} or "exit"): `;
                        this.push(function(choice){
                            if (choice > 0 && choice <= querySnapshot.size) {
                                terminal.pause();
                                var queryDocumentSnapshot = querySnapshot.docs[choice - 1];
                                this.echo('Retrieving all items in region: ' + queryDocumentSnapshot.get('name'))
                                db.collection("items").where('region', '==', queryDocumentSnapshot.id).orderBy('name').get().then(listDocuments);
                                this.pop();
                            }
                        }, {
                            prompt: prompt,
                        });
                    }
                    this.resume();
                });
            },
            add: function(){
                this.push({
                    help: function(){
                        this.echo('[[ub;;]Usage]');
                        this.echo('"region <new-region-name>" : add a new region');
                        this.echo('"item <new-item-name>" : add a new item');
                        this.echo('"help" : display this message');
                    },
                    region: function(name) {
                        if (typeof name != 'string') {
                            this.error('Name must be entered');
                            return;
                        }
                        name = name.trim();
                        if (!name.length) {
                            this.error('Name cannot be empty');
                            return;
                        }
                        terminal.pause();
                        this.echo(`Adding new region: ${name}`);
                        db.collection("regions").add({
                            name: name
                        })
                        .then(docRef => {
                            this.echo("Region written with ID: " + docRef.id);
                            terminal.resume();
                        });
                    },
                    item: function(name){
                        if (typeof name != 'string') {
                            this.error('Name must be entered');
                            return;
                        }
                        name = name.trim();
                        if (!name.length) {
                            this.error('Name cannot be empty');
                            return;
                        }
                        terminal.pause();
                        this.echo(`Adding new item: ${name}`);
                        db.collection("regions").orderBy('name').get()
                        // db.ref('/regions').once('value')
                        .then(querySnapshot => {
                            if (querySnapshot.empty){
                                this.echo('Add a region first');
                            } else {
                                var prompt = '';
                                var i = 0;
                                for (var i = 0; i < querySnapshot.size; i++) {
                                    var queryDocumentSnapshot = querySnapshot.docs[i];
                                    prompt += `${i + 1}: ${queryDocumentSnapshot.get('name')}\n`;
                                }
                                prompt += `Enter a number between 1 and ${querySnapshot.size} (or "exit"): `;
                                this.push(function(choice){
                                    if (choice > 0 && choice <= querySnapshot.size) {
                                        terminal.pause();
                                        // var region = querySnapshot.docs[choice - 1];
                                        // console.log(JSON.stringify(obj));
                                        db.collection("items").add({
                                            name: name,
                                            region: querySnapshot.docs[choice - 1].id
                                        })
                                        .then(docRef => {
                                            this.echo("Item written with ID: " + docRef.id);
                                            this.pop();
                                            terminal.resume();
                                        });
                                    }
                                }, {
                                    prompt: prompt,
                                });
                            }
                            terminal.resume();
                        });
                    }
                }, {
                    prompt: 'add > '
                });
            }
        },
        function(string){
            this.error(`Could not understand "${string}". Try "help"`);
        }
        ], {
        greetings: 'Anatomy',
        name: 'quiz',
        height: 400,
        prompt: '> ',
        checkArity: true
    });
    
    function listDocuments(querySnapshot) {
        if (querySnapshot.size) {
            terminal.echo('Found: ' + querySnapshot.size);
            querySnapshot.forEach(queryDocumentSnapshot => {
                terminal.echo(queryDocumentSnapshot.get('name'));
            });
        } else {
            terminal.echo('None found!');
        }
        terminal.resume();
    };

});