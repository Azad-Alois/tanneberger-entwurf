<?php
// Einstellungen des Anfrageformulars (je Kunde anpassen). PHP-Datei: im Browser nicht lesbar.
return [
    'domain'            => 'tanneberger-service.de',
    'empfaenger'        => 'kontakt@tanneberger-service.de',
    'absender'          => 'kontakt@tanneberger-service.de',
    'absender_name'     => 'Webseite Tanneberger Service',
    'erlaubte_herkunft' => ['https://tanneberger-service.de', 'https://www.tanneberger-service.de'],
    'max_pro_stunde'    => 5,
    'salz'              => 'tanneberger-anfrage-2026',
];
