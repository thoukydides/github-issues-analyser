// GitHub issues analyser
// Copyright © 2026 Alexander Thoukydides

// Configuration for a repository
export interface ConfigRepository {
    owner:  string;
    repo:   string;
}

// All repositories to process
export const CONFIG: ConfigRepository[] = [
    { owner: 'thoukydides', repo: 'matterbridge-dyson-robot' },
    { owner: 'thoukydides', repo: 'homebridge-homeconnect' }
];