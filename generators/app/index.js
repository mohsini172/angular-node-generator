'use strict';
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');

module.exports = class extends Generator {
	initialize() {
		this.attributeData = [];
		this.attributeData = {};
		this.tsParams = {};
		this.mongooseModel = {};
		this.tsModel = {};
		this._askModelName();
	}


	_askModelName() {
		return this.prompt([{
			type: 'input',
			name: 'ModelName',
			message: 'Name of the Model?',
			default: "NA"
		}]).then(props => {
			this.FileName = props.ModelName;
			this.tsModelName = this._toPascalCase(props.ModelName);
			this.tsModelObj = this._toCamelCase(props.ModelName);
			this._askAttribute();
		})
	}

	_askAttribute() {
		return this.prompt([{
			type: 'input',
			name: 'Attribute',
			message: 'Name of the Attribute? Press enter without name to exit',
			default: ""
		}]).then(props => {
			if (props.Attribute !== "") {
				this.attributeData[props.Attribute] = "";
				this._askType(props.Attribute);
			} else {
				var tsModel = {};
				var jsModel = {};
				for (var i in this.attributeData) {
					tsModel[i] = this.attributeData[i].toLowerCase();
				}
				this.mongooseModel = JSON.stringify(this.attributeData).replace(/\"/g, "");
				this.tsModel = JSON.stringify(tsModel).replace(/\"/g, "");
				return this._writing();
			}
		})
	}
	_askType(attribute) {
		return this.prompt([{
			type: 'list',
			name: 'AttributeType',
			message: 'Type of attribute(string)',
			default: "string",
			choices: [
				"String",
				"Number",
				"Date",
				"Boolean",
				"Array",
				"ObjectId"
			]
		}]).then(props => {
			this.attributeData[attribute] = props.AttributeType;
			this._askAttribute();
		})
	}

	_toCamelCase(str) {
		return str.replace(/(?:^\w|[A-Z]|\b\w|\s+|\-)/g, function (match, index) {
			if (match == " " || match == "-") return ""; // or if (/\s+/.test(match)) for white spaces
			return index == 0 ? match.toLowerCase() : match.toUpperCase();
		});
	}
	_toPascalCase(str) {
		return str.replace(/(?:^\w|[A-Z]|\b\w|\s+|\-)/g, function (match, index) {
			if (match == " " || match == "-") return ""; // or if (/\s+/.test(match)) for white spaces
			return match.toUpperCase();
		});
	}

	_generateParams(model) {
		let template = "";
		for (var i in model) {
			template += "public " + i + ":" + model[i].toLowerCase() + " = null" + ",";
		}
		return template.substring(0, template.length - 1);
	}

	_generateCreateParams(model) {
		let template = "";
		for (var i in model) {
			template += i + ": req.body." + i + ",";
		}
		return template.substring(0, template.length - 1);
	}

	_generateUpdateParams(model, name) {
		let template = "";
		for (var i in model) {
			template += name + "." + i + " = req.body." + i + " ? req.body." + i + " : " + name + "." + i + "" + ";";
		}
		return template.substring(0, template.length - 1);
	}

	_generateMongooseModel(model) {
		let template = "{";
		for (var i in model) {
			template += i + ":" + model[i] + ",";
		}
		template += "}";
		return template.substring(0, template.length - 1);
	}


	prompting() {
		// Have Yeoman greet the user.
		// this.log(
		//   yosay(`Welcome to the superior ${chalk.red('generator-angular-2-nodejs')} generator!`)
		// );

		const prompts = [{
				type: 'input',
				name: 'Attribute',
				message: 'Name of the Attribute? Press enter without name to exit.',
				default: ""
			},
			{
				type: 'list',
				name: 'AttributeType',
				message: 'Type of attribute(string)',
				default: "string",
				choices: [
					"String",
					"Number",
					"Date",
					"Boolean",
					"Array",
					"ObjectId"
				]
			}
		];
	}

	_writing() {
		console.log("Writing function: ", this.attributeData)
		this.tsParams = this._generateParams(this.attributeData);
		this.createParams = this._generateCreateParams(this.attributeData);
		this.updateParams = this._generateUpdateParams(this.attributeData, this.tsModelName);

		console.log(this.mongooseModel);
		this.fs.copyTpl(
			this.templatePath('service.txt'),
			this.destinationPath(this.FileName + '.service.ts'), {
				mongooseModel: this.mongooseModel,
				tsModelName: this.tsModelName,
				tsModelObj: this.tsModelObj,
				tsParams: this.tsParams,
				fileName: this.FileName
			}
		);
		this.fs.copyTpl(
			this.templatePath('component.txt'),
			this.destinationPath(this.FileName + '.component.ts'), {
				mongooseModel: this.mongooseModel,
				tsModelName: this.tsModelName,
				tsModelObj: this.tsModelObj,
				tsParams: this.tsParams,
				fileName: this.FileName
			}
		);
		this.fs.copyTpl(
			this.templatePath('mongoose.model.txt'),
			this.destinationPath(this.FileName + '.model.js'), {
				modelName: this.tsModelName,
				mongooseModel: this.mongooseModel
			}
		);
		this.fs.copyTpl(
			this.templatePath('controller.txt'),
			this.destinationPath(this.FileName + '.controller.js'), {
				modelName: this.tsModelName,
				createParams: this.createParams,
				updateParams: this.updateParams
			}
		);
	}

	// install() {
	//   // this.installDependencies();
	// }
};
