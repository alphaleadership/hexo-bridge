import { useEffect, useState } from "react";
import Navigation from "../shared/components/Navigation";
import NavigationSettings from "./NavigationSettings";
import { AxiosRequestConfig } from "axios";
import {
  Button,
  Callout,
  Card,
  ControlGroup,
  FormGroup,
  Intent,
  NumericInput,
  Spinner,
  Switch,
} from "@blueprintjs/core";
import useAPI from "../shared/useAPI";
import GenericError from "../shared/components/GenericError";
import { Notification } from "../index";

//API Config
const getBridgeConfig: AxiosRequestConfig = {
  method: "GET",
  url: "settings/bridge/get",
};
const saveBridgeConfig: AxiosRequestConfig = {
  method: "POST",
  url: "settings/bridge/save",
};

const defaultConfig = {
  // Font size for the code editor. The default is 14.
  editorFontSize: 14,
  editorDarkMode: false,
  // All posts page.
  post_list_itemsPerPage: 7,
  post_list_showCategories: true,
  post_list_showTags: true,
  // All pages page.
  page_list_itemsPerPage: 7,
  // When new posts, pages, etc, are created, hexo needs to update its database before bridge is allowed to display the editor.
  // This config controls the waiting time before attempting to fetch the newly created content.
  content_fetch_timeout: 200, //# Time is in milliseconds
};
export default function BridgeSettingsPage() {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [bridgeConfig, setBridgeConfig] = useState(defaultConfig);
  const [fileName, setFileName] = useState("bridge.json");
  const { loading: isLoading, error, data: configData } = useAPI(getBridgeConfig);
  const { execute: saveConfig } = useAPI(
    {
      ...saveBridgeConfig,
      data: {
        config: JSON.stringify(bridgeConfig),
      },
    },
    true
  );

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
        message: "An error occurred while saving the config. ",
        intent: Intent.DANGER,
        icon: "error",
      });
    }
  }

  //Init
  useEffect(() => {
    if (configData?.config) {
      const parsedConfig = JSON.parse(configData.config);
      setBridgeConfig(parsedConfig);
      setFileName(configData.fileName);
    }
  }, [configData]);

  if (isLoading) {
    return <Spinner />;
  }
  if (error) {
    return <GenericError />;
  }

  return (
    <>
      <Navigation />
      <NavigationSettings />
      <ControlGroup style={{ margin: "5px" }}>
        <Callout style={{ maxWidth: "fit-content" }} icon="info-sign">
          <b>Filename:</b> {fileName}
        </Callout>
        <span style={{ flexGrow: 1 }} />
        <Button icon="floppy-disk" minimal text="Save" disabled={!hasUnsavedChanges} onClick={onSave} />
      </ControlGroup>

      <Card
        style={{
          margin: "auto 0.5rem",
          padding: "1rem",
          display: "flex",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "1rem",
          }}
        >
          <FormGroup
            label="Posts per page"
            labelFor="post_list_itemsPerPage"
            helperText="Number of posts to show per page in the post list."
          >
            <NumericInput
              id="post_list_itemsPerPage"
              required={true}
              placeholder="Enter a number..."
              value={bridgeConfig.post_list_itemsPerPage}
              onValueChange={(value) => {
                setBridgeConfig({ ...bridgeConfig, post_list_itemsPerPage: value });
                setHasUnsavedChanges(true);
              }}
            />
          </FormGroup>
          <FormGroup
            label="Pages per page"
            labelFor="page_list_itemsPerPage"
            helperText="Number of pages to show per page in the page list."
          >
            <NumericInput
              id="page_list_itemsPerPage"
              required={true}
              placeholder="Enter a number..."
              value={bridgeConfig.page_list_itemsPerPage}
              onValueChange={(value) => {
                setBridgeConfig({ ...bridgeConfig, page_list_itemsPerPage: value });
                setHasUnsavedChanges(true);
              }}
            />
          </FormGroup>
          <FormGroup
            label="Show categories"
            labelFor="post_list_showCategories"
            helperText="Show categories in the post and page list."
          >
            <Switch
              id="post_list_showCategories"
              checked={bridgeConfig.post_list_showCategories}
              onChange={(event) => {
                setBridgeConfig({ ...bridgeConfig, post_list_showCategories: event.currentTarget.checked });
                setHasUnsavedChanges(true);
              }}
              innerLabel="Hide"
              innerLabelChecked="Show"
            />
          </FormGroup>

          <FormGroup label="Show tags" labelFor="post_list_showTags" helperText="Show tags in the post and page list.">
            <Switch
              id="post_list_showTags"
              checked={bridgeConfig.post_list_showTags}
              onChange={(event) => {
                setBridgeConfig({ ...bridgeConfig, post_list_showTags: event.currentTarget.checked });
                setHasUnsavedChanges(true);
              }}
              innerLabel="Hide"
              innerLabelChecked="Show"
            />
          </FormGroup>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "1rem",
          }}
        >
          <FormGroup label="Editor font size" labelFor="editorFontSize">
            <NumericInput
              id="editorFontSize"
              required={true}
              placeholder="Enter a number..."
              value={bridgeConfig.editorFontSize}
              onValueChange={(value) => {
                setBridgeConfig({ ...bridgeConfig, editorFontSize: value });
                setHasUnsavedChanges(true);
              }}
            />
          </FormGroup>
          <FormGroup label="Editor theme" labelFor="editorDarkMode">
            <Switch
              id="editorDarkMode"
              checked={bridgeConfig.editorDarkMode}
              onChange={(event) => {
                setBridgeConfig({ ...bridgeConfig, editorDarkMode: event.currentTarget.checked });
                setHasUnsavedChanges(true);
              }}
              innerLabel="Light theme"
              innerLabelChecked="Dark theme"
            />
          </FormGroup>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "1rem",
          }}
        >
          <FormGroup
            label="Content fetch timeout"
            labelFor="content_fetch_timeout"
            helperText="Time(in milliseconds) to wait before attempting to fetch newly created content."
          >
            <NumericInput
              id="content_fetch_timeout"
              required={true}
              placeholder="Enter a number..."
              value={bridgeConfig.content_fetch_timeout}
              onValueChange={(value) => {
                setBridgeConfig({ ...bridgeConfig, content_fetch_timeout: value });
                setHasUnsavedChanges(true);
              }}
            />
          </FormGroup>
        </div>
      </Card>
    </>
  );
}
