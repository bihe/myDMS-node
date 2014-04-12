/*
 * basic controller logic to display the different templates
 * base.js created by Henrik Binggl
 */
'use strict';

exports.index = function(req, res){
  res.json(
		[
			"Abfertigung", "Abo", "Apple", "Arzt", "Asus", "Auto", "BC400", "Family", "Finanzamt", "Firma", "Garantie", "Handy", "Haus", "Heidi", "Heizung", "IBIS", "IPad", "Jahreskarte", "Kaminkehrer", "Kirche", "Laptop", "Mama", "Max", "Neukirchen", "Notar", "Onlineshop", "Palfinger", "S-Bahn", "Tobi", "Unfallversicherung", "Urlaub", "Versicherung", "XBox", "Zahnarzt", "Zeitung" 
	  ]
  	);
};