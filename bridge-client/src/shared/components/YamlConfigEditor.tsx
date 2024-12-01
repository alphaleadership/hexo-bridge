import { useContext, useEffect, useState } from "react";
import { Button, Callout, ControlGroup, Intent, Spinner } from "@blueprintjs/core";
import { Notification } from "../../index";
import GenericError from "./GenericError";
import { AxiosRequestConfig } from "axios";
import useAPI from "../useAPI";
import CodeMirror from "@uiw/react-codemirror";
import { EditorView } from "@codemirror/view";
import { StreamLanguage } from "@codemirror/language";
import { linter, Diagnostic, lintGutter } from "@codemirror/lint";
import { yaml } from "@codemirror/legacy-modes/mode/yaml";
import { UserPreferencesContext } from "../userPreferencesContext";
import jsYaml, { YAMLException } from "js-yaml";

type YamlConfigEditorProps = {
  getContentConfig: AxiosRequestConfig;
  saveContentConfig: AxiosRequestConfig;
};

function validateYaml(content: string) {
  try {
    jsYaml.load(content);
    return [];
  } catch (error) {
    console.error("YAML validation error.", error);
    return [error as YAMLException];
  }
}

export default function YamlConfigEditor(props: YamlConfigEditorProps) {
  const userPreferences = useContext(UserPreferencesContext);
  const { loading: isLoading, error, data: configData } = useAPI(props.getContentConfig);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [config, setConfig] = useState("");
  const { execute: saveConfig } = useAPI(
    {
      ...props.saveContentConfig,
      data: {
        config: config,
      },
    },
    true
  );

  //Init
  useEffect(() => {
    setConfig(configData.config);
  }, [configData]);

  const [errorMarker, setErrorMarker] = useState<Diagnostic>();

  useEffect(() => {
    const validate = async () => {
      const validationResult = validateYaml(config);
      if (validationResult && validationResult.length === 0) {
        setErrorMarker(undefined);
      } else {
        setErrorMarker({
          from: validationResult[0].mark.position,
          to: config.indexOf(" ", validationResult[0].mark.position),
          message: validationResult[0].message,
          severity: "error",
        });
      }
    };
    validate();
  }, [config]);

  async function onSave() {
    try {
      await saveConfig();
      Notification.show({
        message: "The config has been saved! ",
        intent: Intent.SUCCESS,
        icon: "saved",
      });
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Unable to save config.", error);
      Notification.show({
        message: "Oh no, I can't save the config. 😟 ",
        intent: Intent.DANGER,
        icon: "delete",
      });
    }
  }

  const yamlLinter = linter((view) => {
    let diagnostics: Diagnostic[] = [];
    if (errorMarker) {
      diagnostics.push(errorMarker);
    }
    return diagnostics;
  });

  function getCurrentState() {
    if (isLoading) {
      return <Spinner />;
    }
    if (error) {
      return <GenericError />;
    }
    return (
      <>
        <ControlGroup style={{ margin: "5px" }}>
          <Callout style={{ maxWidth: "fit-content" }} icon="info-sign">
            <b>Filename:</b> {configData.fileName}
          </Callout>
          <span style={{ flexGrow: 1 }} />
          <Button
            icon="floppy-disk"
            minimal
            text="Save"
            disabled={!hasUnsavedChanges || Boolean(errorMarker)}
            onClick={onSave}
          />
        </ControlGroup>
        <CodeMirror
          width="99vw"
          height="83vh"
          theme={userPreferences.editorTheme}
          style={{
            fontSize: userPreferences.editorFontSize || 14,
          }}
          extensions={[StreamLanguage.define(yaml), EditorView.lineWrapping, yamlLinter, lintGutter()]}
          value={config}
          onChange={(newContent) => {
            setConfig(newContent);
            setHasUnsavedChanges(true);
          }}
        />
      </>
    );
  }

  return getCurrentState();
}
